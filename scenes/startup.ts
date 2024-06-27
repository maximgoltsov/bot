import { Markup, Scenes } from "telegraf";
import { MyContext, StartupScenes } from "./types";
import { getMessage } from "../utils";
import { chatId } from "../index";

export const startupMainScene = new Scenes.BaseScene<MyContext>(StartupScenes.MAIN);
startupMainScene.enter(ctx => {
  return ctx.reply(
    "Главное меню стартапа",
    Markup.inlineKeyboard([
      Markup.button.callback('Профиль проекта', 'profile'),
      Markup.button.callback('Поиск команды', 'findTeam'),
      Markup.button.url('Полезные матриалы', 'http://ya.ru'),
      Markup.button.url('Сообщество Founder Fusion', 'https://t.me/Founderfusion'),
    ])
  )
})
startupMainScene.action('profile', async (ctx) => {
  await ctx.scene.enter(StartupScenes.PROFILE);
});
startupMainScene.action('findTeam', async (ctx) => {
  await ctx.scene.enter(StartupScenes.FIND_TEAM);
});
///////
export const profileScene = new Scenes.BaseScene<MyContext>(StartupScenes.PROFILE);
profileScene.enter(async ctx => {
  if(ctx.session.project?.userName !== undefined) {
    let result = Array(6);
    result.push(`Ваш текущий профиль\n\n`);
    result.push(`1) Имя: ${ctx.session.project.userName}\n`);
    result.push(`2) Роль: ${ctx.session.project.userRole}\n`);
    result.push(`3) Название проекта: ${ctx.session.project.title}\n`);
    result.push(`4) Сфера: ${ctx.session.project.themes}\n`);
    result.push(`5) Описание: ${ctx.session.project.description}\n`);
    result.push(`6) Ссылка на проект: ${ctx.session.project.projectUrl}\n`);

    await ctx.reply(
      result.join(''),
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          Markup.button.callback("Заполнить заново", 'newProfile'),
          Markup.button.callback("Назад", 'main'),
        ])
      },
    );
  } else {
    await ctx.reply(`Ваш профиль проекта не заполнен`);
    return ctx.scene.enter(StartupScenes.CREATE_PROFILE);
  }
})
profileScene.action('newProfile', ctx => ctx.scene.enter(StartupScenes.CREATE_PROFILE));
profileScene.action('main', ctx => ctx.scene.enter(StartupScenes.MAIN));
///////
export const startupFindTeam = new Scenes.BaseScene<MyContext>(StartupScenes.FIND_TEAM);
startupFindTeam.enter(async ctx => {
  return ctx.reply(
    'Поиск команды',
    {
      ...Markup.inlineKeyboard([
        Markup.button.url('Биржа резюме', 'https://t.me/founderfusionteam'),
        Markup.button.callback('Разместить вакансию', 'createJob'),
        Markup.button.callback('Назад', 'back'),
      ])
    }
  )
})
startupFindTeam.action('back', ctx => ctx.scene.enter(StartupScenes.MAIN));
startupFindTeam.action('createJob', ctx => ctx.scene.enter(StartupScenes.CREATE_JOB));
///////
export const startupProfileForm = new Scenes.WizardScene<MyContext>(
  StartupScenes.CREATE_PROFILE,
  async ctx => {
    await ctx.reply('Как вас зовут?');

    return ctx.wizard.next();
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.project = {
        userName: message,
      }

      await ctx.reply('Какая ваша роль в проекте')
      return ctx.wizard.next();
    }

    await ctx.reply('Как вас зовут?');
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.project.userRole = message;

      await ctx.reply('Название вашего проекта?')
      return ctx.wizard.next();
    }

    await ctx.reply('Какая ваша роль в проекте')
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.project.title = message;

      await ctx.reply('Ссылка на сайт вашего проекта.')
      return ctx.wizard.next();
    }

    await ctx.reply('Название вашего проекта?');
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.project.projectUrl = message;

      await ctx.reply('В какой сфере проект?')
      return ctx.wizard.next();
    }

    await ctx.reply('Ссылка на сайт вашего проекта.');
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.project.themes = message;

      await ctx.reply('Краткое описание вашего проекта?')
      return ctx.wizard.next();
    }

    await ctx.reply('В какой сфере проект?')
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.project.description = message;

      await ctx.reply('Профиль вашего проекта заполнен')
      return ctx.scene.enter(StartupScenes.PROFILE);
    }

    await ctx.reply('Краткое описание вашего проекта?')
  },
);
//////
export const startupCreateJob = new Scenes.WizardScene<MyContext>(
  StartupScenes.CREATE_JOB,
  async ctx => {
    await ctx.reply('Вы поиске каких специалиста вы находитесь? (Например, блокчейн разработчик)');

    return ctx.wizard.next();
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.job = {
        specs: message,
      }

      await ctx.reply('Опишите вашу вакансию. (1. Краткое описание должности 2. Условия работы 3. Требуемый опыт)')
      return ctx.wizard.next();
    }

    await ctx.reply('Вы поиске каких специалиста вы находитесь? (Например, блокчейн разработчик)');
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.job.description = message;

      let result = Array(5);
      result.push(`Новое резюме от @${ctx.message?.from.username}\n\n`);
      result.push(`1) Кого ищет: ${ctx.session.job.specs}\n`);
      result.push(`2) Описание вакансии: ${ctx.session.job.description}\n`);

      await ctx.telegram.sendMessage(chatId, result.join(''))

      await ctx.reply('Вакансия заполнена и отправлена на модерацию')
      return ctx.scene.enter(StartupScenes.FIND_TEAM);
    }

    await ctx.reply('Опишите вашу вакансию. (1. Краткое описание должности 2. Условия работы 3. Требуемый опыт)')
  },
);
//////
