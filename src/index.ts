import joplin from 'api';
import { ContentScriptType, SettingItemType } from 'api/types';

joplin.plugins.register({
  onStart: async function() {

    await joplin.contentScripts.register(
      ContentScriptType.CodeMirrorPlugin,
      'emojiPicker',
      './emojiPicker.js'
    );

    await joplin.settings.onChange(function(){
      joplin.commands.execute('editor.execCommand', {name: "setOption", args: ["emojiPicker", true]});
    });

    await joplin.settings.registerSection('settings.emojiPicker', {
      label: 'Emoji Picker',
      iconName: 'fa-light fa-face-grin-wide'
    });

    await joplin.settings.registerSettings({
      'trigger': {
        value: ':',
        isEnum: true,
        options: {
          ':': ':',
          '::': '::',
        },
        type: SettingItemType.String,
        section: 'settings.emojiPicker',
        public: true,
        label: 'Emoji Picker Trigger',
        description: `You can choose between triggering the emoji picker by ": with a character" or "::".`
      },
    });

    await joplin.settings.onChange(function(){
      joplin.commands.execute('editor.execCommand', {name: "setOption", args: ["emojiPicker", true]});
    });

    await joplin.contentScripts.onMessage('emojiPicker', async (message:any) => {
      if (message == "getTrigger") {
        var trigger = await joplin.settings.value('trigger') as string;
        return trigger;
      // }
      } else {
        console.log(message);
        
      }
    });
  },
});
