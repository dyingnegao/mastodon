import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';
import SettingToggle from '../../notifications/components/setting_toggle';
import CardContainer from '../containers/card_container';
import Video from '../../video';

@injectIntl
export default class ColumnSettings extends React.PureComponent {
  
  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    settings: ImmutablePropTypes.map.isRequired,
    status: ImmutablePropTypes.map.isRequired,
    onOpenMedia: PropTypes.func.isRequired,
    onOpenVideo: PropTypes.func.isRequired,
    onToggleHidden: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,

  };

  handleOpenVideo = (media, startTime) => {
    this.props.onOpenVideo(media, startTime);
  }

  render () {
        const status = this.props.status.get('reblog') ? this.props.status.get('reblog') : this.props.status;

    let media           = '';
    let applicationLink = '';
    let reblogLink = '';
    let reblogIcon = 'retweet';

    if (status.get('media_attachments').size > 0) {
      if (status.get('media_attachments').some(item => item.get('type') === 'unknown')) {
        media = <AttachmentList media={status.get('media_attachments')} />;
      } else if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
        const video = status.getIn(['media_attachments', 0]);

        media = (
          <Video
            preview={video.get('preview_url')}
            src={video.get('url')}
            alt={video.get('description')}
            width={300}
            height={150}
            inline
            onOpenVideo={this.handleOpenVideo}
            sensitive={status.get('sensitive')}
          />
        );
      } else {
        media = (
          <MediaGallery
            standalone
            sensitive={status.get('sensitive')}
            media={status.get('media_attachments')}
            height={300}
            onOpenMedia={this.props.onOpenMedia}
          />
        );
      }
    } else if (status.get('spoiler_text').length === 0) {
      media = <CardContainer onOpenMedia={this.props.onOpenMedia} statusId={status.get('id')} />;
    }

    if (status.get('application')) {
      applicationLink = <span> · <a className='detailed-status__application' href={status.getIn(['application', 'website'])} target='_blank' rel='noopener'>{status.getIn(['application', 'name'])}</a></span>;
    }

    if (status.get('visibility') === 'direct') {
      reblogIcon = 'envelope';
    } else if (status.get('visibility') === 'private') {
      reblogIcon = 'lock';
    }

    if (status.get('visibility') === 'private') {
      reblogLink = <i className={`fa fa-${reblogIcon}`} />;
    } else {
      reblogLink = (<Link to={`/statuses/${status.get('id')}/reblogs`} className='detailed-status__link'>
        <i className={`fa fa-${reblogIcon}`} />
        <span className='detailed-status__reblogs'>
          <FormattedNumber value={status.get('reblogs_count')} />
        </span>
      </Link>);
    }
    const { settings, onChange } = this.props;

    return (
      <div>
        <span className='column-settings__section'><FormattedMessage id='home.column_settings.basic' defaultMessage='Basic' /></span>

        <div className='column-settings__row'>
          <SettingToggle prefix='home_timeline' settings={settings} settingPath={['shows', 'reblog']} onChange={onChange} label={<FormattedMessage id='home.column_settings.show_reblogs' defaultMessage='Show boosts' />} />
        </div>

        <div className='column-settings__row'>
          <SettingToggle prefix='home_timeline' settings={settings} settingPath={['shows', 'reply']} onChange={onChange} label={<FormattedMessage id='home.column_settings.show_replies' defaultMessage='Show replies' />} />
        </div>
      </div>

      <div className='detailed-status'>
        <a href={status.getIn(['account', 'url'])} onClick={this.handleAccountClick} className='detailed-status__display-name'>
          <div className='detailed-status__display-avatar'><Avatar account={status.get('account')} size={48} /></div>
          <DisplayName account={status.get('account')} />
        </a>

        <StatusContent status={status} expanded={!status.get('hidden')} onExpandedToggle={this.handleExpandedToggle} />

        {media}

        <div className='detailed-status__meta'>
          <a className='detailed-status__datetime' href={status.get('url')} target='_blank' rel='noopener'>
            <FormattedDate value={new Date(status.get('created_at'))} hour12={false} year='numeric' month='short' day='2-digit' hour='2-digit' minute='2-digit' />
          </a>{applicationLink} · {reblogLink} · <Link to={`/statuses/${status.get('id')}/favourites`} className='detailed-status__link'>
            <i className='fa fa-star' />
            <span className='detailed-status__favorites'>
              <FormattedNumber value={status.get('favourites_count')} />
            </span>
          </Link>
        </div>
      </div>
    );
  }

}
