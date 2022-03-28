import joplin from 'api';
import { ContentScriptType, SettingItemType } from 'api/types';
const themes = [
  {
    name: "THEME_LIGHT",
    id: 1,
    backgroundColor: "#ffffff",
    color: "#32373F",
  },
  {
    name: "THEME_DARK",
    id: 2,
    backgroundColor: "#1D2024",
    color: "#dddddd",
  },
  {
    name: "THEME_OLED_DARK",
    id: 22,
    backgroundColor: "#000000",
    color: "#dddddd",
  },
  {
    name: "THEME_SOLARIZED_LIGHT",
    id: 3,
    backgroundColor: "#fdf6e3",
    color: "#657b83",
  },
  {
    name: "THEME_SOLARIZED_DARK",
    id: 4,
    backgroundColor: "#002b36",
    color: "#839496",
  },
  {
    name: "THEME_DRACULA",
    id: 5,
    backgroundColor: "#282a36",
    color: "#f8f8f2",
  },
  {
    name: "THEME_NORD",
    id: 6,
    backgroundColor: "#2e3440",
    color: "#e5e9f0",
  },
  {
    name: "THEME_ARITIM_DARK",
    id: 7,
    backgroundColor: "#10151a",
    color: "#d3dae3",
  },
];
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
      if (message === "getTrigger") {
        var trigger = await joplin.settings.value('trigger') as string;
        return trigger;
      // }
      } else if (message === "getTheme") {
        var theme = await joplin.settings.globalValue('theme');
        return themes.find(t => t.id == theme);
      } 
      else {
        console.log(message);
        
      }
    });
  },
});
