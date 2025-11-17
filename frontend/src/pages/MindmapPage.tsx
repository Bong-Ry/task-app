import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
// D3.jsは直接DOM操作を行うため、ここでは描画ロジックは最小限に留めます
import * as d3 from 'd3'; 
import Button from '../components/UI/Button';

// --- 型定義 ---

// DBから取得する生データ構造
interface ClientRaw { id: number; name: string; }
interface ProjectRaw { id: number; client_id: number; name: string; }
interface TaskRaw { id: number; project_id: number; parent_task_id: number | null; name: string; }

// 階層データ構造 (D3向け)
interface MindmapNode {
    id: number | string;
    name: string;
    type: 'client' | 'project' | 'task' | 'subtask';
    children?: MindmapNode[];
    project_id?: number; // タスク/サブタスクが所属するプロジェクトID
}

// --- メインコンポーネント ---

function MindmapPage() {
    const [mapData, setMapData] = useState<MindmapNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    // --- データ取得と階層構造の構築ロジック ---
    const buildMindmapHierarchy = (
        clients: ClientRaw[],
        projects: ProjectRaw[],
        tasks: TaskRaw[]
    ): MindmapNode | null => {
        if (clients.length === 0) return null;

        // 1. 全タスクを親タスクIDとプロジェクトIDでマップ化
        const tasksByParent = new Map<number, TaskRaw[]>();
        const parentTasksByProject = new Map<number, TaskRaw[]>();

        tasks.forEach(task => {
            // ★ 注意: DBでparent_task_idカラムがBIGINTである前提です
            const parentId = task.parent_task_id as number | null; 
            if (parentId) {
                // サブタスク
                if (!tasksByParent.has(parentId)) {
                    tasksByParent.set(parentId, []);
                }
                tasksByParent.get(parentId)!.push(task);
            } else {
                // 親タスク
                if (!parentTasksByProject.has(task.project_id)) {
                    parentTasksByProject.set(task.project_id, []);
                }
                parentTasksByProject.get(task.project_id)!.push(task);
            }
        });

        // 2. タスク階層を再帰的に構築
        const buildTaskTree = (taskId: number): MindmapNode[] | undefined => {
            const childrenRaw = tasksByParent.get(taskId);
            if (!childrenRaw) return undefined;

            return childrenRaw.map(t => ({
                id: t.id,
                name: t.name,
                type: 'subtask',
                project_id: t.project_id,
                children: buildTaskTree(t.id),
            }));
        };

        // 3. プロジェクト階層を構築
        const projectsNodes: MindmapNode[] = projects.map(project => {
            const tasksRaw = parentTasksByProject.get(project.id) || [];
            
            const taskNodes: MindmapNode[] = tasksRaw.map(task => ({
                id: task.id,
                name: task.name,
                type: 'task',
                project_id: project.id,
                children: buildTaskTree(task.id),
            }));

            return {
                id: project.id,
                name: project.name,
                type: 'project',
                children: taskNodes.length > 0 ? taskNodes : undefined,
            };
        });

        // 4. クライアント階層（ルート）を構築
        return {
            id: 'root',
            name: '全クライアント',
            type: 'client',
            children: projectsNodes.length > 0 ? projectsNodes : undefined,
        };
    };

    // --- データ取得ロジック ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // 全クライアント、プロジェクト、タスクを一度に取得
            const [clientsRes, projectsRes, tasksRes] = await Promise.all([
                supabase.from('clients').select('id, name'),
                supabase.from('projects').select('id, client_id, name'),
                // ★ 全タスクを取得 (Subtaskの親IDを含む)
                supabase.from('tasks').select('id, project_id, name, parent_task_id'), 
            ]);

            if (clientsRes.error || projectsRes.error || tasksRes.error) {
                throw new Error("データ取得エラー: " + (clientsRes.error?.message || projectsRes.error?.message || tasksRes.error?.message));
            }
            
            const mapStructure: MindmapNode | null = buildMindmapHierarchy(
                clientsRes.data || [], 
                projectsRes.data || [], 
                tasksRes.data || []
            );

            setMapData(mapStructure);

        } catch (err: any) {
            setError(err.message);
            setMapData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); 

    // --- D3描画ロジックの実行 ---
    useEffect(() => {
        if (mapData && svgRef.current) {
            // D3描画の初期化処理
            const container = svgRef.current.parentElement;
            if (!container) return;

            const width = container.clientWidth;
            const height = 600; // 固定の高さを使用

            const svg = d3.select(svgRef.current)
                .attr("width", width)
                .attr("height", height)
                .html(''); 

            const g = svg.append("g").attr("transform", `translate(50, ${height / 2})`); 

            // D3のツリーレイアウトを使用
            const treeLayout = d3.tree<MindmapNode>().size([height, width - 200]);
            
            const root = d3.hierarchy(mapData);
            treeLayout(root);

            // リンク (線) の描画
            g.selectAll('.link')
                .data(root.links())
                .enter().append('path')
                .attr('class', 'link')
                .attr('fill', 'none')
                .attr('stroke', '#ccc')
                .attr('stroke-width', 2)
                .attr('d', d3.linkHorizontal()
                    .x((d: any) => d.y)
                    .y((d: any) => d.x)
                );

            // ノード (丸と文字) の描画
            const node = g.selectAll('.node')
                .data(root.descendants())
                .enter().append('g')
                .attr('class', d => `node node-${d.data.type}`)
                .attr('transform', d => `translate(${d.y}, ${d.x})`);

            node.append('circle')
                .attr('r', 8)
                .attr('fill', d => {
                    if (d.data.type === 'client') return '#333';
                    if (d.data.type === 'project') return '#3B82F6';
                    if (d.data.type === 'task') return '#10B981';
                    return '#F59E0B';
                });

            node.append('text')
                .attr('dy', 5)
                .attr('x', 12)
                .text(d => d.data.name)
                .style('font-size', '14px');

        }
    }, [mapData]); 


    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🌍 マインドマップ（階層構造）</h2>
            
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500">クライアント、プロジェクト、タスクの関連性を可視化しています。</p>
                <Button onClick={fetchData} disabled={loading}>再読み込み</Button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-card min-h-[600px]">
                {loading && <div className="p-8 text-center">データを構築中...</div>}
                {error && <div className="p-8 text-center text-red-600">エラー: {error}</div>}
                {mapData && !loading && (
                    // D3描画キャンバス
                    <svg ref={svgRef} style={{ width: '100%', height: '600px' }}></svg>
                )}
                {!mapData && !loading && !error && (
                    <div className="p-8 text-center text-gray-500">表示できるデータがありません。</div>
                )}
            </div>
        </div>
    );
}

export default MindmapPage;
