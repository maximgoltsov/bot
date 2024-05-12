import { Telegraf, Scenes, session, Markup } from 'telegraf';
import { FinderScenes, MyContext, StartupScenes } from './scenes/types';
import { startupMainScene, profileScene, startupCreateJob, startupFindTeam, startupProfileForm } from './scenes/startup';
import { finderCreateProfile, finderMainScene, finderProfileScene } from './scenes/finder';

require('dotenv').config()

const token = process.env.BOT_TOKEN;
export const chatId = process.env.CHAT_ID ?? '';

if(token !== undefined) {
  const bot = new Telegraf<MyContext>(token);
  const stage = new Scenes.Stage<MyContext>([
    startupMainScene, profileScene, startupProfileForm, startupFindTeam, startupCreateJob,
    finderCreateProfile, finderMainScene, finderProfileScene
  ]);

  bot.use((ctx, next) => {
    if(ctx.chat?.type === 'private') return next();
  })
  bot.use(session());
  bot.use(stage.middleware());

  // bot.start(ctx => ctx.scene.enter(StartupScenes.MAIN));
  bot.on('message', ctx => {
    if(ctx.session.isStartup === undefined)
      return ctx.reply(
        'Выберите свою роль',
        Markup.inlineKeyboard([
          Markup.button.callback('Как стартап', 'startup'),
          Markup.button.callback('Как специалист', 'finder')
        ])
      )

      if(ctx.session.isStartup)
        return ctx.scene.enter(StartupScenes.MAIN);
      else
        return ctx.scene.enter(FinderScenes.MAIN);
  })
  bot.action('startup', ctx => {
    ctx.session.isStartup = true;
    return ctx.scene.enter(StartupScenes.MAIN);
  })
  bot.action('finder', ctx => {
    ctx.session.isStartup = false;
    return ctx.scene.enter(FinderScenes.MAIN);
  })

  bot.launch();
  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
