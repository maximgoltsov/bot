import { Composer, Markup, Scenes } from "telegraf";
import { FinderScenes, MyContext } from "./types";
import { getMessage } from "../utils";
import { chatId } from  "../";

export const finderMainScene = new Scenes.BaseScene<MyContext>(FinderScenes.MAIN);
finderMainScene.enter(ctx => ctx.reply(
  "Главное меню специалиста",
  Markup.inlineKeyboard([
    Markup.button.callback('Профиль', 'profile'),
    Markup.button.url('Поиск работы', 'https://t.me/founderfusionvac'),
    Markup.button.url('Полезные материалы', 'https://possible-odometer-e29.notion.site/9220835defcb45568e2374db1760fb8e?pvs=4'),
    Markup.button.url('Сообщество Founder Fusion', 'https://t.me/Founderfusion'),
  ])
));
finderMainScene.action('profile', async ctx => {
  await ctx.scene.enter(FinderScenes.PROFILE);
})
////////////////////////////////////////////////////////
export const finderProfileScene = new Scenes.BaseScene<MyContext>(FinderScenes.PROFILE);
finderProfileScene.enter(async ctx => {
  if(ctx.session.resume?.description !== undefined) {
    let result = Array(7);
    result.push(`Ваш текущий профиль\n\n`);
    result.push(`1) Имя: ${ctx.session.resume.name}\n`);
    result.push(`2) Сфера деятельности: ${ctx.session.resume.specs}\n`);
    result.push(`3) Информации о себе и компетенциях: ${ctx.session.resume.description}\n`);
    result.push(`4) Образование и опыт работы: ${ctx.session.resume.exp}\n`);
    result.push(`5) Портфолио: ${ctx.session.resume.resumeUrl}\n`);
    result.push(`6) Видео-визитка: ${ctx.session.resume.videoResumeUrl}\n`);
    result.push(`7) Стоимость и условия работы: ${ctx.session.resume.rate}\n`);

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
    await ctx.reply('Ваш профиль не заполнен');
    return ctx.scene.enter(FinderScenes.CREATE_PROFILE);
  }
})
finderProfileScene.action('newProfile', ctx => ctx.scene.enter(FinderScenes.CREATE_PROFILE));
finderProfileScene.action('main', ctx => ctx.scene.enter(FinderScenes.MAIN));
////////////////////////////////////////////////////////
const finderUrlStepHandler = new Composer<MyContext>();
finderUrlStepHandler.on('message', async ctx => {
  const message = getMessage(ctx);

  if(message) {
    ctx.session.resume.resumeUrl = message;

    await ctx.reply(
      'Видео-визитка (ссылка на видео)',
      Markup.inlineKeyboard([
        Markup.button.callback('Пропустить', 'skip')
      ])
    )
    return ctx.wizard.next();
  }

  await ctx.reply(
    'Ваше портфолио (ссылка на работы или сайт/презентацию/резюме)',
    Markup.inlineKeyboard([
      Markup.button.callback('Пропустить', 'skip')
    ])
  )
})
finderUrlStepHandler.action('skip', async ctx => {
  await ctx.reply(
    'Видео-визитка (ссылка на видео)',
    Markup.inlineKeyboard([
      Markup.button.callback('Пропустить', 'skip')
    ])
  )

  return ctx.wizard.next()
});
/////
const finderVideoUrl = new Composer<MyContext>();
finderVideoUrl.on('message', async ctx => {
  const message = ctx.text;

  if(message) {
    ctx.session.resume.videoResumeUrl = message;

    await ctx.reply(
      'Стоимость и условия вашей работы. (Full time/ проектная работа и тд.)',
    )

    return ctx.wizard.next();
  }

  await ctx.reply(
    'Видео-визитка (ссылка на видео)',
    Markup.inlineKeyboard([
      Markup.button.callback('Пропустить', 'skip')
    ])
  )
})
finderVideoUrl.action('skip', async ctx => {
  await ctx.reply(
    'Стоимость и условия вашей работы. (Full time/ проектная работа и тд.)',
  )

  return ctx.wizard.next();
})

export const finderCreateProfile = new Scenes.WizardScene<MyContext>(
  FinderScenes.CREATE_PROFILE,
  async ctx => {
    await ctx.reply('Как вас зовут?');

    return ctx.wizard.next();
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.resume = {
        name: message,
      }

      await ctx.reply('Ваша сфера деятельности?')
      return ctx.wizard.next();
    }

    await ctx.reply('Как вас зовут?');
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.resume.specs = message;

      await ctx.reply('Информации о себе и своих компетенциях')
      return ctx.wizard.next();
    }

    await ctx.reply('Ваша сфера деятельности?')
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.resume.description = message;

      await ctx.reply('Ваше образование и опыт работы (дипломы, курсы, сертифкиаты.)')
      return ctx.wizard.next();
    }

    await ctx.reply('Информации о себе и своих компетенциях')
  },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.resume.exp = message;

      await ctx.reply(
        'Ваше портфолио (ссылка на работы или сайт/презентацию/резюме)',
        Markup.inlineKeyboard([
          Markup.button.callback('Пропустить', 'skip')
        ])
      )

      return ctx.wizard.next();
    }

    await ctx.reply('Ваше образование и опыт работы (дипломы, курсы, сертифкиаты.)')
  },
  finderUrlStepHandler,
  // async ctx => {
  //   const message = getMessage(ctx);

  //   if(message) {
  //     ctx.session.resume.resumeUrl = message;

  //     await ctx.reply('Ваша видео визитка. Она позволит повысить лояльность потенциальных работодателей. Расскажите о себе, своих навыках, покажите свои работы.')
  //     return ctx.wizard.next();
  //   }

  //   await ctx.reply('Ссылка на ваше портфолио.')
  // },
  finderVideoUrl,
  // async ctx => {
  //   const message = getMessage(ctx);

  //   if(message) {
  //     ctx.session.resume.videoResumeUrl = message;

  //     let result = Array(7);
  //     result.push(`Новое резюме от @${ctx.message?.from.username}\n\n`);
  //     result.push(`1) ${ctx.session.resume.name}\n`);
  //     result.push(`2) ${ctx.session.resume.specs}\n`);
  //     result.push(`3) ${ctx.session.resume.description}\n`);
  //     result.push(`4) ${ctx.session.resume.exp}\n`);
  //     result.push(`5) ${ctx.session.resume.resumeUrl}\n`);
  //     result.push(`6) ${ctx.session.resume.videoResumeUrl}\n`);

  //     await ctx.telegram.sendMessage(chatId, result.join(''));

  //     await ctx.reply('Резюме заполнено и отправлено на модерацию.')
  //     return ctx.scene.enter(FinderScenes.PROFILE);
  //   }

  //   await ctx.reply('Ваша видео визитка. Она позволит повысить лояльность потенциальных работодателей. Расскажите о себе, своих навыках, покажите свои работы.')
  // },
  async ctx => {
    const message = getMessage(ctx);

    if(message) {
      ctx.session.resume.rate = message;

      let result = Array(8);
      result.push(`Новое резюме от @${ctx.message?.from.username}\n\n`);
      result.push(`1) Имя: ${ctx.session.resume.name}\n`);
      result.push(`2) Сфера: ${ctx.session.resume.specs}\n`);
      result.push(`3) О себе: ${ctx.session.resume.description}\n`);
      result.push(`4) Образование и опыт: ${ctx.session.resume.exp}\n`);
      result.push(`5) Ссылка на портфолио: ${ctx.session.resume.resumeUrl ?? ''}\n`);
      result.push(`6) Визитка: ${ctx.session.resume.videoResumeUrl ?? ''}\n`);
      result.push(`7) Стоимость и условия вашей работы: ${ctx.session.resume.rate?? ''}\n`);

      await ctx.telegram.sendMessage(chatId, result.join(''));

      await ctx.reply('Резюме заполнено и отправлено на модерацию.')
      return ctx.scene.enter(FinderScenes.PROFILE);
    }

    await ctx.reply('Ваше образование и опыт работы (дипломы, курсы, сертифкиаты.)')
  },
);
////////////////////////////////////////////////////////
