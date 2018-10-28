import { importFetchedStatus, importFetchedStatuses } from './importer';
import api, { getLinks } from '../api';
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';

export const TIMELINE_UPDATE  = 'TIMELINE_UPDATE';
export const TIMELINE_DELETE  = 'TIMELINE_DELETE';

export const TIMELINE_EXPAND_REQUEST = 'TIMELINE_EXPAND_REQUEST';
export const TIMELINE_EXPAND_SUCCESS = 'TIMELINE_EXPAND_SUCCESS';
export const TIMELINE_EXPAND_FAIL    = 'TIMELINE_EXPAND_FAIL';

export const TIMELINE_SCROLL_TOP = 'TIMELINE_SCROLL_TOP';

export const TIMELINE_DISCONNECT = 'TIMELINE_DISCONNECT';

export function updateTimeline(timeline, status) {
  return (dispatch, getState) => {
    const references = status.reblog ? getState().get('statuses').filter((item, itemId) => (itemId === status.reblog.id || item.get('reblog') === status.reblog.id)).map((_, itemId) => itemId) : [];

    dispatch(importFetchedStatus(status));

    dispatch({
      type: TIMELINE_UPDATE,
      timeline,
      status,
      references,
    });
  };
};

export function deleteFromTimelines(id) {
  return (dispatch, getState) => {
    const accountId  = getState().getIn(['statuses', id, 'account']);
    const references = getState().get('statuses').filter(status => status.get('reblog') === id).map(status => [status.get('id'), status.get('account')]);
    const reblogOf   = getState().getIn(['statuses', id, 'reblog'], null);

    dispatch({
      type: TIMELINE_DELETE,
      id,
      accountId,
      references,
      reblogOf,
    });
  };
};

const noOp = () => {};

export function expandTimeline(timelineId, path, params = {}, done = noOp) {
  return (dispatch, getState) => {
    const timeline = getState().getIn(['timelines', timelineId], ImmutableMap());

    if (timeline.get('isLoading')) {
      done();
      return;
    }

    if (!params.max_id && !params.pinned && timeline.get('items', ImmutableList()).size > 0) {
      params.since_id = timeline.getIn(['items', 0]);
    }

    dispatch(expandTimelineRequest(timelineId));

    api(getState).get(path, { params }).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      dispatch(expandTimelineSuccess(timelineId, response.data, next ? next.uri : null, response.code === 206));
      done();
    }).catch(error => {
      dispatch(expandTimelineFail(timelineId, error));
      done();
    });
  };
};

export const expandHomeTimeline            = ({ maxId } = {}, done = noOp) => expandTimeline('home', '/api/v1/timelines/home', { max_id: maxId }, done)
export const expandPublicTimeline          = ({ maxId, onlyMedia } = {}, done = noOp) => expandTimeline(`public${onlyMedia ? ':media' : ''}`, '/api/v1/timelines/public', { max_id: maxId, only_media: !!onlyMedia }, done);
export const expandCommunityTimeline       = ({ maxId, onlyMedia } = {}, done = noOp) => expandTimeline(`community${onlyMedia ? ':media' : ''}`, '/api/v1/timelines/public', { local: true, max_id: maxId, only_media: !!onlyMedia }, done);
export const expandDirectTimeline          = ({ maxId } = {}, done = noOp) => expandTimeline('direct', '/api/v1/timelines/direct', { max_id: maxId }, done);
export const expandAccountTimeline         = (accountId, { maxId, withReplies } = {}) => expandTimeline(`account:${accountId}${withReplies ? ':with_replies' : ''}`, `/api/v1/accounts/${accountId}/statuses`, { exclude_replies: !withReplies, max_id: maxId });
export const expandAccountFeaturedTimeline = accountId => expandTimeline(`account:${accountId}:pinned`, `/api/v1/accounts/${accountId}/statuses`, { pinned: true });
export const expandAccountMediaTimeline    = (accountId, { maxId } = {}) => expandTimeline(`account:${accountId}:media`, `/api/v1/accounts/${accountId}/statuses`, { max_id: maxId, only_media: true });
export const expandHashtagTimeline         = (hashtag, { maxId } = {}, done = noOp) => expandTimeline(`hashtag:${hashtag}`, `/api/v1/timelines/tag/${hashtag}`, { max_id: maxId }, done);
export const expandListTimeline            = (id, { maxId } = {}, done = noOp) => expandTimeline(`list:${id}`, `/api/v1/timelines/list/${id}`, { max_id: maxId }, done);

export function expandTimelineRequest(timeline) {
  return {
    type: TIMELINE_EXPAND_REQUEST,
    timeline,
  };
};

export function expandTimelineSuccess(timeline, statuses, next, partial) {
  return {
    type: TIMELINE_EXPAND_SUCCESS,
    timeline,
    statuses,
    next,
    partial,
  };

export function expandTimelineFail(timeline, error) {
  return {
    type: TIMELINE_EXPAND_FAIL,
    timeline,
    error,
  };
};

export function scrollTopTimeline(timeline, top) {
  return {
    type: TIMELINE_SCROLL_TOP,
    timeline,
    top,
  };
};

export function disconnectTimeline(timeline) {
  return {
    type: TIMELINE_DISCONNECT,
    timeline,
  };
};

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
