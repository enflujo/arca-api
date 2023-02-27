import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ action }) => {
  action('obras.items.create', () => {
    console.log('elemento created!');
  });

  action('obras.items.update', () => {
    console.log('Item updated!');
  });

  action('obras.items.delete', () => {
    console.log('Item deleted!');
  });
});
