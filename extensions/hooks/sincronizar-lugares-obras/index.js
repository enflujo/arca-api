'use strict';

function defineHook(config) {
    return config;
}

var index = defineHook(({ action }) => {
  action("obras.items.create", () => {
    console.log("elemento created!");
  });
  action("obras.items.update", () => {
    console.log("Item updated!");
  });
  action("obras.items.delete", () => {
    console.log("Item deleted!");
  });
});

module.exports = index;
