import type { Problem, Progress } from './data'
import { supabase } from './auth'

export async function fetchProblems(): Promise<Problem[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('problems')
    .select('id,number,title,platform,url,difficulty,topic_id,subtopic_id,xp,sort_order,importance,tags,is_published')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((p: any) => ({
    id: p.id,
    number: p.number ?? String(p.sort_order),
    title: p.title,
    platform: 'LeetCode',
    url: p.url,
    difficulty: p.difficulty,
    topicId: p.topic_id,
    conceptId: p.subtopic_id,
    xp: p.xp,
    order: p.sort_order,
    importance: p.importance ?? undefined,
    source: 'admin' as const,
    tags: p.tags ?? [],
    published: p.is_published ?? true,
  }))
}

export async function createProblem(input: Omit<Problem, 'source'> & { published: boolean }) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.from('problems').insert({
    id: input.id,
    number: input.number,
    title: input.title,
    platform: input.platform,
    url: input.url,
    difficulty: input.difficulty,
    topic_id: input.topicId,
    subtopic_id: input.conceptId,
    xp: input.xp,
    sort_order: input.order,
    importance: input.importance ?? null,
    tags: input.tags ?? [],
    is_published: input.published,
  })
  if (error) throw new Error(error.message)
}

export async function updateProblemPublished(id: string, published: boolean) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.from('problems').update({ is_published: published }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProblem(id: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.from('problems').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function fetchProgress(userId: string): Promise<Record<string, Progress>> {
  if (!supabase) return {}
  const { data, error } = await supabase
    .from('user_problem_progress')
    .select('problem_id,status,attempts,revision_required,completed_at,last_attempt_at')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  const result: Record<string, Progress> = {}
  for (const row of data ?? []) {
    result[row.problem_id] = {
      status: row.status,
      attempts: row.attempts,
      revisionRequired: row.revision_required,
      completedAt: row.completed_at ?? undefined,
      lastAttemptAt: row.last_attempt_at ?? undefined,
    }
  }
  return result
}

export async function saveProgressItem(userId: string, problemId: string, progress: Progress) {
  if (!supabase) return
  const { error } = await supabase.from('user_problem_progress').upsert({
    user_id: userId,
    problem_id: problemId,
    status: progress.status,
    attempts: progress.attempts,
    revision_required: progress.revisionRequired,
    completed_at: progress.completedAt ?? null,
    last_attempt_at: progress.lastAttemptAt ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,problem_id' })
  if (error) throw new Error(error.message)
}


export type BulkProblemInput = Omit<Problem, 'source'>

export async function createProblemsBulk(inputs: Array<BulkProblemInput & { published: boolean }>) {
  if (!supabase) throw new Error('Supabase is not configured.')
  if (!inputs.length) return

  const rows = inputs.map(input => ({
    id: input.id,
    number: input.number,
    title: input.title,
    platform: input.platform,
    url: input.url,
    difficulty: input.difficulty,
    topic_id: input.topicId,
    subtopic_id: input.conceptId,
    xp: input.xp,
    sort_order: input.order,
    importance: input.importance ?? null,
    tags: input.tags ?? [],
    is_published: input.published,
  }))

  const { error } = await supabase.from('problems').insert(rows)
  if (error) throw new Error(error.message)
}
