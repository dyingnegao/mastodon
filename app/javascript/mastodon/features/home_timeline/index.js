import React from 'react';
import { connect } from 'react-redux';
import { expandHomeTimeline } from '../../actions/timelines';
import PropTypes from 'prop-types';
import StatusListContainer from '../ui/containers/status_list_container';
import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ColumnSettingsContainer from './containers/column_settings_container';
import { Link } from 'react-router-dom';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
});

const mapStateToProps = state => ({
  hasUnread: state.getIn(['timelines', 'home', 'unread']) > 0,
  isPartial: state.getIn(['timelines', 'home', 'items', 0], null) === null,
});

@connect(mapStateToProps)
@injectIntl
export default class HomeTimeline extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    shouldUpdateScroll: PropTypes.func,
    intl: PropTypes.object.isRequired,
    hasUnread: PropTypes.bool,
    isPartial: PropTypes.bool,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
  };

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('HOME', {}));
    }
  }

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  }

  setRef = c => {
    this.column = c;
  }

  handleLoadMore = maxId => {
    this.props.dispatch(expandHomeTimeline({ maxId }));
  }

  componentDidMount () {
    this._checkIfReloadNeeded(false, this.props.isPartial);
  }

  componentDidUpdate (prevProps) {
    this._checkIfReloadNeeded(prevProps.isPartial, this.props.isPartial);
  }

  componentWillUnmount () {
    this._stopPolling();
  }

  _checkIfReloadNeeded (wasPartial, isPartial) {
    const { dispatch } = this.props;
    if (wasPartial === isPartial) {
      return;
    } else if (!wasPartial && isPartial) {
      this.polling = setInterval(() => {
        dispatch(expandHomeTimeline());
      }, 3000);
    } else if (wasPartial && !isPartial) {
      this._stopPolling();
    }
  }

  _stopPolling () {
    if (this.polling) {
      clearInterval(this.polling);
      this.polling = null;
    }
  }

  render () {
    const { intl, shouldUpdateScroll, hasUnread, columnId, multiColumn } = this.props;
    const pinned = !!columnId;

    return (
      <Column ref={this.setRef} label={intl.formatMessage(messages.title)}>
        <ColumnHeader
          icon='home'
          active={hasUnread}
          title={intl.formatMessage(messages.title)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        >
          <ColumnSettingsContainer />
        </ColumnHeader>

        <StatusListContainer
          trackScroll={!pinned}
          scrollKey={`home_timeline-${columnId}`}
          onLoadMore={this.handleLoadMore}
          timelineId='home'
          emptyMessage={<FormattedMessage id='empty_column.home' defaultMessage='Your home timeline is empty! Visit {public} or use search to get started and meet other users.' values={{ public: <Link to='/timelines/public'><FormattedMessage id='empty_column.home.public_timeline' defaultMessage='the public timeline' /></Link> }} />}
          shouldUpdateScroll={shouldUpdateScroll}
        />
      </Column>
    );
  }

}

var INSTANCE = $(location).attr("host");

function card_formater(url, title, type, description, content, width, height) {
  function escape(str) {
    return str.replace(/[<>&"'`]/g, match => {
      const escape = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "\"": "&quot;",
        "'": "&#39;",
        "`": "&#x60;"
      };
      return escape[match];
    });
  }
  title = escape(title);
  description = escape(description);
  if (description.length > 50) {
    description = description.substr(0, 50);
  }
  if (type == "photo") {
    return `
            <a href="${url}" class="status-card horizontal" target="_blank" rel="noopener">
                <div class="status-card__image">
                    <img src="${content}" alt="${title}" class="status-card__image-image" width="${width}" height="${height}">
                </div>
                <div class="status-card__content">
                    <strong class="status-card__title" title="${title}">${title}</strong>
                    <span class="status-card__host">${
                      url.match(/^https?:\/\/(.*?)\//)[1]
                    }</span>
                </div>
            </a>`;
  } else if (type == "link") {
    if (width > height) {
      return `
                <a href="${url}" class="status-card horizontal" target="_blank" rel="noopener">
                    <div class="status-card__image">
                        <img src="${content}" alt="${title}" class="status-card__image-image" width="${width}" height="${height}">
                    </div>
                    <div class="status-card__content">
                        <strong class="status-card__title" title="${title}">${title}</strong>
                        <span class="status-card__host">${
                          url.match(/^https?:\/\/(.*?)\//)[1]
                        }</span>
                    </div>
                </a>`;
    } else {
      return `
            <a href="${url}" class="status-card" target="_blank" rel="noopener">
                <div class="status-card__image">
                    <img src="${content}" alt="${title}" class="status-card__image-image" width="${width}" height="${height}">
                </div>
                <div class="status-card__content"><strong class="status-card__title" title="${title}">${title}</strong>
                    <p class="status-card__description">${description}</p>
                    <span class="status-card__host">${
                      url.match(/^https?:\/\/(.*?)\//)[1]
                    }</span>
                </div>
            </a>`;
    }
  } else if (type == "video") {
    return `<div class="status-card-video">${content}</div>`;
  }
  return "";
}

(function() {
  "use strict";
  setTimeout(function() {
    $(
      "article:not(:has(.notification)) > div > .status__wrapper > .status:not(.carded)"
    ).each(function() {
      $(this).addClass("carded");
      var id = $(this);
      $.getJSON(
        "https://" +
          INSTANCE +
          "/api/v1/statuses/" +
          id.attr("data-id") +
          "/card"
      ).done(function(data) {
        if (data.html != null && data.html != "") {
          $(id)
            .find(".status__content")
            .after(
              card_formater(
                data.url,
                data.title,
                data.type,
                data.description,
                data.html,
                data.width,
                data.height
              )
            );
        } else if (data.image != null && data.image != "") {
          $(id)
            .find(".status__content")
            .after(
              card_formater(
                data.url,
                data.title,
                data.type,
                data.description,
                data.image,
                data.width,
                data.height
              )
            );
        } // else {$(id).find('.status__content').after("None");}
      });
    });
    new MutationObserver(function(MutationRecords, MutationObserver) {
      $(
        "article:not(:has(.notification)) > div > .status__wrapper > .status:not(.carded)"
      ).each(function() {
        $(this).addClass("carded");
        var id = $(this);
        $.getJSON(
          "https://" +
            INSTANCE +
            "/api/v1/statuses/" +
            id.attr("data-id") +
            "/card"
        ).done(function(data) {
          if (data.html != null && data.html != "") {
            $(id)
              .find(".status__content")
              .after(
                card_formater(
                  data.url,
                  data.title,
                  data.type,
                  data.description,
                  data.html,
                  data.width,
                  data.height
                )
              );
          } else if (data.image != null && data.image != "") {
            $(id)
              .find(".status__content")
              .after(
                card_formater(
                  data.url,
                  data.title,
                  data.type,
                  data.description,
                  data.image,
                  data.width,
                  data.height
                )
              );
          } // else {$(id).find('.status__content').after("None");}
        });
      });
    }).observe($(".columns-area").get(0), {
      childList: true,
      subtree: true
    });
  }, 5000);
})();
