import { Context, Scenes } from "telegraf";

export enum StartupScenes {
  MAIN = 'startupMain',
  PROFILE = 'startupProfile',
  CREATE_PROFILE = 'startupCreateProfile',
  FIND_TEAM = 'startupFindTeem',
  CREATE_JOB = 'startupCreateJob',
}

export enum FinderScenes {
  MAIN = 'finderMain',
  PROFILE = 'finderProfile',
  CREATE_PROFILE = 'finderCreateProfile',
}

export interface IProfileSession extends Scenes.WizardSession {
  isStartup?: boolean,
  project: {
    userName?:string;
    userRole?: string;
    title?: string;
    projectUrl?: string;
    themes?: string;
    description?: string;
  },
  job: {
    specs?: string;
    description?: string;
  },
  resume: {
    name?:string;
    specs?: string;
    description?: string;
    exp?: string;
    resumeUrl?: string;
    videoResumeUrl?: string;
    rate?: string;
  },
}

export interface MyContext extends Context {
  session: IProfileSession;

  // declare scene type
	scene: Scenes.SceneContextScene<MyContext, Scenes.WizardSessionData>;
	// declare wizard type
	wizard: Scenes.WizardContextWizard<MyContext>;
}
