/**
 * Module dependencies
 */

import React from 'react';
import createWidget from './lib/createWidget';

/**
 * Serialize parameters.
 *
 * @param {object} obj
 */

function serialize(obj) {
  const str = [];
  let p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}

/**
 * Convert seconds to millisecond.
 *
 * @param {number} seconds
 */

function secondsToMillisecond(seconds) {
  return seconds * 1000;
}

/**
 * Check whether a `props` change should result in the widget being reload.
 *
 * @param {Object} prevProps
 * @param {Object} props
 */

function shouldReloadWidget(prevProps, props) {
  if (prevProps.url !== props.url) {
    return true;
  }

  if (prevProps.id !== props.id) {
    return true;
  }

  const preVars = prevProps.opts || {};
  const vars = props.opts || {};

  let key;
  for (key in preVars) {
    if (preVars[key] !== vars[key]) {
      return true;
    }
  }
}

/**
 * Create a new `SoundCloud` component.
 *
 * This is essentially a glorified wrapper over the existing
 * HTML5 widget from SoundCloud. Programmatic control not included.
 *
 * NOTE: Changing `props.url` will cause the component to load it.
 * Unfortunately, SoundCloud adds an entry to `window.history` every time
 * a new url is loaded, so changing `props.url` __will__ break the back button.
 */

class SoundCloud extends React.Component {

  /**
   * @param {Object} props
   */

  constructor(props) {
    super(props);
    this._internalWidget = null;
  }

  componentDidMount() {
    this._createWidget();
  }

  componentDidUpdate(prevProps) {
    if (shouldReloadWidget(prevProps, this.props)) {
      this._reloadWidget();
    }

    if (prevProps.paused !== this.props.paused) {
      this._playToggle();
    }

    if (prevProps.seekTime !== this.props.seekTime) {
      this._seekTo(this.props.seekTime);
    }
  }

  componentWillUnmount() {
    this._unbindEvents();
  }

  /**
   * Called on the initial render, this uses the rendered iframe
   * as a base for creating a new `_internalWidget`.
   */

  _createWidget() {
    createWidget(this.props.id, (widget) => {
      this._setupWidget(widget);
    });
  }

  /**
   * Integrate a newly created `widget` with the rest of the component.
   *
   * @param {Object} Widget
   */

  _setupWidget(widget) {
    this._internalWidget = widget;
    this._bindEvents();
  }

  /**
   * This is the only way to manipulate the embedded iframe, it's essentially
   * refreshed and reloaded.
   *
   * NOTE: SoundCloud adds an entry to `window.history` after reloading. This is
   * __really__ annoying, but unavoidable at the moment, so basically every
   * time the url changes it breaks the back button. Super bummer.
   */

  _reloadWidget() {
    this._internalWidget.load(this.props.url, this.props.opts);
  }

  /**
   * Listen for events coming from `widget`, and pass them up the
   * chain to the parent component if needed.
   */

  _bindEvents() {
    this._internalWidget.bind(window.SC.Widget.Events.PLAY_PROGRESS, this.props.onProgress);
    this._internalWidget.bind(window.SC.Widget.Events.PLAY, this.props.onPlay);
    this._internalWidget.bind(window.SC.Widget.Events.PAUSE, this.props.onPause);
    this._internalWidget.bind(window.SC.Widget.Events.FINISH, this.props.onEnd);
    this._internalWidget.bind(window.SC.Widget.Events.SEEK, this.props.onSeek);
    this._internalWidget.bind(window.SC.Widget.Events.ERROR, this.props.onError);
  }

  /**
   * Remove all event bindings.
   */

  _unbindEvents() {
    this._internalWidget.unbind(window.SC.Widget.Events.PLAY_PROGRESS);
    this._internalWidget.unbind(window.SC.Widget.Events.PLAY);
    this._internalWidget.unbind(window.SC.Widget.Events.PAUSE);
    this._internalWidget.unbind(window.SC.Widget.Events.FINISH);
    this._internalWidget.unbind(window.SC.Widget.Events.SEEK);
    this._internalWidget.unbind(window.SC.Widget.Events.ERROR);
  }

  _playToggle() {
    if (!this.props.paused) {
      this._internalWidget.play();
    } else {
      this._internalWidget.pause();
    }
  }

  _seekTo(seekTime) {
    const msSeekTime = secondsToMillisecond(seekTime);
    this._internalWidget.seekTo(msSeekTime);
  }

  /**
   * @returns {Object}
   */

  render() {
    const params = serialize(this.props.opts);
    const iframeSrc = `https://w.soundcloud.com/player/?url=${this.props.url}&${params}`;

    return (
      <iframe id={this.props.id}
              width="100%"
              height={this.props.height || (this.props.opts.visual ? '450' : '166')}
              scrolling="no"
              frameBorder="no"
              src={iframeSrc}
      />
    );
  }
}

SoundCloud.propTypes = {
  // url to play. It's kept in sync, changing it will
  // cause the widget to refresh and play the new url.
  url: React.PropTypes.string.isRequired,

  // custom ID for widget iframe element
  id: React.PropTypes.string,

  height: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),

  // widget parameters for appearance and auto play.
  opts: React.PropTypes.objectOf(React.PropTypes.bool),

  // event subscriptions
  onProgress: React.PropTypes.func,
  onPlay: React.PropTypes.func,
  onPause: React.PropTypes.func,
  onEnd: React.PropTypes.func,
  onSeek: React.PropTypes.func,
  onError: React.PropTypes.func,

  paused: React.PropTypes.bool,

  seekTime: React.PropTypes.number,
};

SoundCloud.defaultProps = {
  id: 'react-sc-widget',
  opts: {},
  onProgress: () => {},
  onPlay: () => {},
  onPause: () => {},
  onEnd: () => {},
  paused: true,
  seekTime: 0,
};

/**
 * Expose `SoundCloud` component
 */

export default SoundCloud;
