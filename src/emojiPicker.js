const emojis = require('./emojibase-data/en/data.json');
const groupsSubgroups = require('./emojibase-data/en/messages.json');
const group = require('./emojibase-data/meta/groups.json');
const elt = require('./utils');
const genEmoji = require('./pickerGen');
module.exports = {

  default: function (_context) {

    // var pickerHtml = genEmoji();

    function plugin(CodeMirror) {

      var startPos = null;
      var TRIGGER_MODE = ':';
      var THEME = null;
      var pickerHtml = null;
      var THEME_CHANGED = false;
      async function showEmojiPicker(cm, change) {
        
        TRIGGER_MODE = await _context.postMessage("getTrigger");
        if(THEME == null || THEME.id !== await _context.postMessage("getTheme").id){
          THEME = await _context.postMessage("getTheme");
          THEME_CHANGED = true;
        }
        _context.postMessage("TRIGGER_MODE " + TRIGGER_MODE);
        _context.postMessage("THEME " + THEME);

        if (THEME_CHANGED || pickerHtml === null) {
          pickerHtml = genEmoji(THEME);
          THEME_CHANGED = false;
        }

        // Close the picker if user typed characters below
        if (change.text[0].search(/[()\[\]{};>,.`'"\s\\\n\r]/) !== -1 || cm.getCursor().ch == 0) {
          resetPicker(cm);
        }

        if(TRIGGER_MODE == ':') {
          _context.postMessage("cm.state.emojiPickerStatus: " + cm.state.emojiPickerStatus);
          if (change.removed == ":") {
            resetPicker(cm);
          }
          // Listen for the ":" token
          if (change.text[0] == ':'){
            startPos = cm.getCursor();
            cm.state.emojiPickerStatus += 1;
          }
          _context.postMessage("cm.state.emojiPickerStatus: " + cm.state.emojiPickerStatus);
          // Move the Picker tooltip along with the cursor 
          if (cm.state.emojiPickerStatus >= 1) {
            const cursor = cm.getCursor();
            const token = cm.getRange(startPos, cursor);
            if (token.length >= 1) {
              if (cm.state.emojiPicker) remove(cm.state.emojiPicker);
              var where = cm.cursorCoords();
              cm.state.emojiPicker = makeTooltip(
                where.right + 1,
                where.bottom,
                token,
                cm
              );
            }
          }
        } else if (TRIGGER_MODE == '::') {
          _context.postMessage("cm.state.emojiPickerStatus: " + cm.state.emojiPickerStatus);
          if (change.removed == ":" && cm.state.emojiPickerStatus > 0) {
            cm.state.emojiPickerStatus -= 1;
          }
          if (cm.state.emojiPickerStatus == 0) {
            resetPicker(cm);
          }
          // Listen for the ":" token
          if (change.text[0] == ':'){
            startPos = cm.getCursor();
            cm.state.emojiPickerStatus += 1;
          } else {
            if (cm.state.emojiPickerStatus == 1) {
              resetPicker(cm);
            }
          }
          _context.postMessage("cm.state.emojiPickerStatus: " + cm.state.emojiPickerStatus);
          // Move the Picker tooltip along with the cursor 
          if (cm.state.emojiPickerStatus >= 2) {
            const cursor = cm.getCursor();
            const token = cm.getRange(startPos, cursor);
            if (cm.state.emojiPicker) remove(cm.state.emojiPicker);
            var where = cm.cursorCoords();
            cm.state.emojiPicker = makeTooltip(
              where.right + 1,
              where.bottom,
              token,
              cm
            );
          }
        }
      }

      function makeTooltip(x, y, token, cm, className) {
        _context.postMessage("makeTooltip");
        var node = elt(
          "div",
          "tooltip" + " " + (className || ""),
        );
        node.style.left = x + "px";
        node.style.top = y + "px";
        node.style.position = "absolute";

        node.innerHTML = pickerHtml;
        
        var container =
          ((cm.options || {}).hintOptions || {}).container || document.body;
        container.appendChild(node);

        // Search for emojis using token
        if(token != null && token != undefined && token != '' && token != ' ') {
          Array.prototype.forEach.call(document.querySelectorAll('.intercom-emoji-picker-emoji:not([name*="' + token + '"])'),function(el){  
            // el.style.display = 'none';
            el.className += ' hidden';
          });
        }

        // If all the emojis are hidden, remove the group title
        groupsSubgroups.groups.forEach(function(group) {
          if (document.querySelectorAll('.intercom-emoji-picker-group-content[name="' + group.message + '"] span:not(.hidden)').length == 0) {
            document.querySelector('.intercom-emoji-picker-group[name="' + group.message + '"]').style.display = 'none';
          } else {
            document.querySelector('.intercom-emoji-picker-group[name="' + group.message + '"]').style.display = 'block';
          }
        })

        // Click handler
        document.addEventListener('click', function(e) {
          if(e.target.className.search('intercom') == -1) {
            resetPicker(cm);
            this.removeEventListener('click',arguments.callee,false);
          }
          // Remove token and replaced with emoji
          if(e.target.className == 'intercom-emoji-picker-emoji'){
            line = startPos.line;
            ch = startPos.ch - TRIGGER_MODE.length;
            cm.replaceRange(e.target.innerText, {line, ch}, cm.getCursor());
            resetPicker(cm);
            // Reactivate cursor
            cm.focus();
            if(TRIGGER_MODE == ':') {
              cm.setCursor(line, ch + e.target.innerHTML.length);
            } else if (TRIGGER_MODE == '::') {
              cm.setCursor(line, ch + e.target.innerHTML.length + 1);
            }   
            this.removeEventListener('click',arguments.callee,false);
          }
        });
        
        // If the Picker is out of the window, move it back in
        var pos = cm.cursorCoords();
        var box = document.querySelector(".intercom-composer-popover");

        if (pos.top - box.offsetHeight < 0) {
          // Fits below cursor
          box.style.top = 5 + "px";
          box.style.removeProperty = "buttom";
        } else {
          box.style.bottom = 30 + "px";
          box.style.removeProperty = "top";
        }

        if (pos.left - box.offsetWidth < 0) {
          box.style.right = "unset";
        } else if (pos.left + box.offsetWidth > window.innerWidth) {
          box.style.right = "calc(50%)";
        } else {
          box.style.right = "calc(50% - 165px)";
        }

        // Change theme according to the app setting

        // var popover = document.querySelector('.intercom-composer-popover.intercom-composer-emoji-popover');
        // popover.style.backgroundColor = THEME.backgroundColor;

        // popover.style.color = THEME.color;

        // Select the first emoji
        // var firstEmoji = document.querySelector('.intercom-emoji-picker-group-content span:not(.hidden)');
        // // Keyboard navigation
        // document.addEventListener('keydown', function(e) {})

        return node;
      }

      function remove(node) {
        var p = node && node.parentNode;
        if (p) p.removeChild(node);
      }

      function resetPicker(cm) {
        _context.postMessage("resetPicker");
        cm.state.emojiPickerStatus = 0;
        startPos = null;
        remove(cm.state.emojiPicker);
      }


      CodeMirror.defineOption(
        "emojiPicker",
        false,
        async function (cm, val, old) {
          if (old && old != CodeMirror.Init) {
            cm.state.emojiPickerStatus = 0;
            cm.off("change", showEmojiPicker);
          }
          if (val) {
            cm.state.emojiPickerStatus = 0;
            cm.on("change", showEmojiPicker);
          }
        }
      );

    }

    return {
      plugin: plugin,
      codeMirrorOptions: { emojiPicker: true },
      assets: function () {
        return [{ name: "./emoji-picker.css" }];
      },
    };
  },
};
