import React from 'react';
import StatusPill from '../common/StatusPill';
import { useDataContext } from '../../context/DataContext';
import { formatDate } from '../../utils/format';

const ProjectsPage: React.FC = () => {
  const { projects, updateProjectStage } = useDataContext();

  return (
    <div className="space-y-6">
      {projects.map(project => (
        <section key={project.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
              <p className="text-sm text-slate-500">
                {project.code} • {project.type} • Due {formatDate(project.dueDate)}
              </p>
            </div>
            <StatusPill tone="indigo">{project.status}</StatusPill>
          </div>
          <div className="space-y-4 px-6 py-6">
            {project.stages.map(stage => (
              <div key={stage.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{stage.name}</p>
                    <p className="text-xs text-slate-500">Owner: {stage.ownerRole}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      SLA: {stage.slaHours}h • Started {formatDate(stage.startedAt)} • Due {formatDate(stage.dueAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusPill
                      tone={
                        stage.status === 'completed'
                          ? 'emerald'
                          : stage.status === 'in_progress'
                          ? 'indigo'
                          : stage.status === 'blocked'
                          ? 'rose'
                          : 'gray'
                      }
                    >
                      {stage.status.replace('_', ' ')}
                    </StatusPill>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProjectStage(project.id, stage.id, 'in_progress')}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => updateProjectStage(project.id, stage.id, 'completed')}
                        className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-400"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ProjectsPage;
