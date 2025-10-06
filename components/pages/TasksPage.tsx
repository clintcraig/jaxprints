import React from 'react';
import StatusPill from '../common/StatusPill';
import { useDataContext } from '../../context/DataContext';
import { formatDate } from '../../utils/format';

const statuses: Array<{ name: 'Not Started' | 'In Progress' | 'Blocked' | 'Done'; tone: React.ComponentProps<typeof StatusPill>['tone'] }> = [
  { name: 'Not Started', tone: 'gray' },
  { name: 'In Progress', tone: 'indigo' },
  { name: 'Blocked', tone: 'rose' },
  { name: 'Done', tone: 'emerald' },
];

const TasksPage: React.FC = () => {
  const { tasks, projects, updateTaskStatus } = useDataContext();

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {statuses.map(column => (
        <div key={column.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{column.name}</h2>
            <StatusPill tone={column.tone}>{tasks.filter(task => task.status === column.name).length}</StatusPill>
          </div>
          <div className="mt-4 space-y-3">
            {tasks
              .filter(task => task.status === column.name)
              .map(task => {
                const project = projects.find(item => item.id === task.projectId);
                return (
                  <article key={task.id} className="rounded-xl border border-slate-100 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
                    <p className="text-xs text-slate-500">{project?.name ?? 'General Task'}</p>
                    <p className="mt-1 text-xs text-slate-500">Owner: {task.assignee}</p>
                    <p className="mt-1 text-xs text-slate-500">Due {formatDate(task.dueAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {statuses.map(status => (
                        <button
                          key={status.name}
                          onClick={() => updateTaskStatus(task.id, status.name)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                            status.name === column.name
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                              : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                          }`}
                        >
                          {status.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksPage;
