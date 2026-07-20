/**
 * Every piece of UI this plugin injects — floating button, menu panel,
 * site prompt, toasts, and the element-picker overlays — mounts inside this
 * single shadow root instead of directly in document.body.
 *
 * Shadow DOM stops the host page's stylesheets from selector-matching into
 * our markup (and ours from leaking out), which is what let job sites'
 * global CSS silently override things like our text color. Selector
 * matching aside, plain CSS *inheritance* (color, font, line-height, ...)
 * still crosses the shadow boundary from the host element down into the
 * tree, so the `:host { all: initial }` reset below cuts that off too —
 * every top-level box then sets its own font/color explicitly, same as
 * before, but now starting from a clean slate instead of whatever the page
 * happened to set on <body>.
 */
const HOST_ID = 'offerextract-ui-root';

let root: ShadowRoot | null = null;

export function getUIRoot(): ShadowRoot {
  if (root) return root;

  const host = document.createElement('div');
  host.id = HOST_ID;
  document.body.appendChild(host);

  root = host.attachShadow({ mode: 'open' });

  const reset = document.createElement('style');
  reset.textContent = ':host { all: initial; }';
  root.appendChild(reset);

  return root;
}
