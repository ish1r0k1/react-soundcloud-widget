import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import CustomWidget from './components/CustomWidget';
import OptionsTable from './components/OptionsTable';
import OptionsInput from './components/OptionsInput';
import { RaisedButton } from 'material-ui';

class Example extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: 'soundcloud-id',
      url: 'https://soundcloud.com/sylvanesso/coffee',
      opts: [
        {name: 'auto_play', purpose: 'Start playing the widget after it’s loaded', toggled: false},
        {name: 'visual', purpose: 'Display widget in visual mode', toggled: true},
        {name: 'buying', purpose: 'Show/hide buy buttons', toggled: true},
        {name: 'liking', purpose: 'Show/hide like buttons', toggled: true},
        {name: 'download', purpose: 'Show/hide download buttons', toggled: true},
        {name: 'sharing', purpose: 'Show/hide share buttons/dialogues', toggled: true},
        {name: 'show_artwork', purpose: 'Show/hide artwork', toggled: true},
        {name: 'show_comments', purpose: 'Show/hide comments', toggled: true},
        {name: 'show_playcount', purpose: 'Show/hide number of sound plays', toggled: true},
        {name: 'show_user', purpose: 'Show/hide the uploader name', toggled: true},
        {name: 'show_reposts', purpose: 'Show/hide reposts', toggled: false},
        {name: 'hide_related', purpose: 'Show/hide related tracks', toggled: false},
      ],
      'widgetStatus': 'pause',
      paused: true,
      seekTime: '0',
    };
  }

  render() {
    const _seekTime = this.state.seekTime - 0;

    return (
      <div className="container">
        <div className="widget">
          <CustomWidget
            url={this.state.url}
            id={this.state.id}
            opts={this.state.opts}
            paused={this.state.paused}
            seekTime={_seekTime}
            onPlay={() => {
              this.setState({ widgetStatus: 'play' });
            }}
            onPause={() => {
              this.setState({ widgetStatus: 'pause' });
            }}
          />
        </div>

        <div className="options">
          <RaisedButton
            label={this.state.widgetStatus !== 'play' ? 'play' : 'pause'}
            primary
            onClick={() => {
              this.setState({
                paused: this.state.widgetStatus !== 'play' ? false : true,
                widgetStatus: this.state.widgetStatus !== 'play' ? 'play' : 'pause',
              });
            }}
          />
          <OptionsInput
            type="URL"
            default={this.state.url}
            onChange={url => this.setState({ url })} />
          <OptionsInput
            type="ID"
            default={this.state.id}
            onChange={id => this.setState({ id })} />
          <OptionsTable
            opts={this.state.opts}
            onChange={opts => this.setState({ opts })} />
          <OptionsInput
            type="Seek time"
            default={this.state.seekTime}
            onChange={seekTime => this.setState({ seekTime })} />
        </div>
      </div>
    );
  }
}

injectTapEventPlugin();
ReactDOM.render(<Example />, document.getElementById('react-root'));
