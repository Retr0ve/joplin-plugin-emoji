import joplin from 'api';
import { ContentScriptType } from 'api/types';

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
  },
});
