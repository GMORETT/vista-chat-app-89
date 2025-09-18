import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from '../App';
import { MountOptions } from './types';
import '../index.css';
import '../styles/theme.css';

const mountedApps = new Map<Element, Root>();

export const mountOperator = async (container: Element, options: MountOptions = {}): Promise<void> => {
  // Unmount if already mounted
  if (mountedApps.has(container)) {
    unmount(container);
  }

  // Create wrapper with namespace for CSS isolation
  const wrapper = document.createElement('div');
  wrapper.className = 'solabs-mfe';
  container.appendChild(wrapper);

  // Create React root and render
  const root = createRoot(wrapper);
  mountedApps.set(container, root);

  root.render(
    <App 
      mountOptions={options}
      appType="operator"
    />
  );

  // Setup resize observer for iframe communication
  if (options.onResize) {
    const resizeObserver = new ResizeObserver(() => {
      const height = wrapper.offsetHeight;
      options.onResize?.(height);
    });
    resizeObserver.observe(wrapper);
  }
};

export const mountAdmin = async (container: Element, options: MountOptions = {}): Promise<void> => {
  // Unmount if already mounted
  if (mountedApps.has(container)) {
    unmount(container);
  }

  // Create wrapper with namespace for CSS isolation
  const wrapper = document.createElement('div');
  wrapper.className = 'solabs-mfe';
  container.appendChild(wrapper);

  // Create React root and render
  const root = createRoot(wrapper);
  mountedApps.set(container, root);

  root.render(
    <App 
      mountOptions={options}
      appType="admin"
    />
  );

  // Setup resize observer for iframe communication
  if (options.onResize) {
    const resizeObserver = new ResizeObserver(() => {
      const height = wrapper.offsetHeight;
      options.onResize?.(height);
    });
    resizeObserver.observe(wrapper);
  }
};

export const unmount = (container: Element): void => {
  const root = mountedApps.get(container);
  if (root) {
    root.unmount();
    mountedApps.delete(container);
  }
  
  // Remove wrapper
  const wrapper = container.querySelector('.solabs-mfe');
  if (wrapper) {
    wrapper.remove();
  }
};