const elt = require('./utils');
const emojis = require('emojibase-data/en/data.json');
const groupsSubgroups = require('emojibase-data/en/messages.json');
const group = require('emojibase-data/meta/groups.json');

var genEmoji = function() {
    var popover = elt("div", "intercom-composer-popover intercom-composer-emoji-popover")
    var picker = popover.appendChild(elt("div", "intercom-emoji-picker"));
    var body = picker.appendChild(elt("div", "intercom-composer-popover-body"));
    var groups = body.appendChild(elt("div", "intercom-emoji-picker-groups"));

    var categories = {};
    emojis.forEach((emojiItem) => {
        if (Object.keys(categories).indexOf(String(emojiItem.group)) === -1 && emojiItem.hasOwnProperty('group')){
        var groupDiv = groups.appendChild(elt("div", "intercom-emoji-picker-group"));

        var groupLabel = groupsSubgroups.groups.find((groupMsg) => {return group.groups[emojiItem.group] == groupMsg.key}).message;

        groupDiv.appendChild(elt("div", "intercom-emoji-picker-group-title", groupLabel, groupLabel));
        categories[emojiItem.group] = groupDiv; 
        
        }
        if (emojiItem.hasOwnProperty('group') && emojiItem.version <= 12){
        categories[emojiItem.group].append(elt("span", "intercom-emoji-picker-emoji", emojiItem.label, emojiItem.emoji));
        } 
        // else {
        //   categories['others'].append(elt("span", "intercom-emoji-picker-emoji", emojiItem.label, emojiItem.emoji));
        // }
    })

    return popover.outerHTML;
}

module.exports = genEmoji;