import { Telegraf, Markup, Scenes, Composer, session } from 'telegraf';

const token = '7164455918:AAHV_xFcFJayO75npxaUfjgoXfo4q3_Ltm0';

if(token !== undefined) {
  const stepHandler = new Composer<Scenes.WizardContext>();

  stepHandler.action("next", async ctx => {
    await ctx.reply("Step 2. Via inline button");
    return ctx.wizard.next();
  });
  stepHandler.command("next", async ctx => {
    await ctx.reply("Step 2. Via command");

    return ctx.wizard.next();
  });
  stepHandler.use(ctx =>
    ctx.replyWithMarkdown("Press `Next` button or type /next"),
  );

  const superWizard = new Scenes.WizardScene(
    "super-wizard",
    async ctx => {
      await ctx.reply(
        "Step 1",
        Markup.inlineKeyboard([
          Markup.button.url("❤️", "http://telegraf.js.org"),
          Markup.button.callback("➡️ Next", "next"),
        ]),
      );
      return ctx.wizard.next();
    },
    stepHandler,
    async ctx => {
      await ctx.reply("Step 3");
      return ctx.wizard.next();
    },
    async ctx => {
      await ctx.reply("Step 4");
      return ctx.wizard.next();
    },
    async ctx => {
      await ctx.reply("Done");
      return await ctx.scene.leave();
    },
  );

  const bot = new Telegraf<Scenes.WizardContext>(token);
  const stage = new Scenes.Stage<Scenes.WizardContext>([superWizard], {
    default: "super-wizard",
  });
  bot.use(session());
  bot.use(stage.middleware());

  bot.launch();

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

const superWizard = new Scenes.WizardScene<Scenes.WizardContext>(
  "super-wizard",
  async ctx => {
    const message = (ctx.update as any).message.text;

    if(message === 'ff'){
      await ctx.reply("will Step 44");
      return ctx.wizard.next();
    }

    return ctx.reply("Step 3");
  },
  async ctx => {
    return ctx.reply("Step 44");
  },
  async ctx => {
    return ctx.reply("Done");
  },
);
