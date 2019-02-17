import * as React from 'react'
import { Button } from 'reactstrap'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { readableClipTime } from 'lib/utility'
import { convertToNowPlayingItem } from 'lib/nowPlayingItem'
import { getLinkUserAs, getLinkUserHref } from 'lib/constants'
const sanitizeHtml = require('sanitize-html')

type Props = {
  episode?: any
  handleLinkClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  handlePauseItem?: (event: React.MouseEvent<HTMLButtonElement>) => void
  handlePlayItem?: (event: React.MouseEvent<HTMLButtonElement>) => void
  handleToggleAddToModal?: (event: React.MouseEvent<HTMLButtonElement>) => void
  handleToggleMakeClipModal?: (event: React.MouseEvent<HTMLButtonElement>) => void
  isLoggedIn?: boolean
  loggedInUserId?: string
  mediaRef?: any
  nowPlayingItem?: any
  playing?: boolean
  playlists: any[]
  podcast?: any
}

type State = {
  showAddToModal: boolean
  showDescription: boolean
}

export class MediaInfo extends React.Component<Props, State> {

  static defaultProps: Props = {
    playlists: []
  }

  constructor (props) {
    super(props)

    this.state = {
      showAddToModal: false,
      showDescription: true
    }
  }

  toggleDescription = () => {
    this.setState(prevState => ({
      showDescription: !prevState.showDescription
    }))
  }

  render () {
    const {episode, handleLinkClick, handlePauseItem, handlePlayItem, loggedInUserId,
      mediaRef, nowPlayingItem, playing, podcast, handleToggleAddToModal,
      handleToggleMakeClipModal } = this.props
    const { showDescription } = this.state

    let title
    let time
    let createdById
    let createdByName
    let createdByIsPublic
    let description
    let currentItem: any = {}

    if (episode) {
      // title = episode.title
      // time = 'Full Episode'
      description = `<p><i>${episode.title}</i></p>`
      description += episode.description
      currentItem = convertToNowPlayingItem(episode)
    } else if (mediaRef) {
      title = mediaRef.title || 'Untitled clip'
      time = readableClipTime(mediaRef.startTime, mediaRef.endTime)
      createdById = mediaRef.owner ? mediaRef.owner.id : ''
      createdByIsPublic = mediaRef.owner ? mediaRef.owner.isPublic : false
      createdByName = mediaRef.owner && mediaRef.owner.name ? mediaRef.owner.name : 'anonymous'
      description = mediaRef.episode.description
      currentItem = convertToNowPlayingItem(mediaRef)
    } else if (nowPlayingItem) {
      title = nowPlayingItem.clipTitle
      time = readableClipTime(nowPlayingItem.clipStartTime, nowPlayingItem.clipEndTime)
      createdById = nowPlayingItem.ownerId
      createdByIsPublic = nowPlayingItem.ownerIsPublic
      createdByName = (mediaRef.owner && mediaRef.owner.name) || 'anonymous'
      description = nowPlayingItem.episodeDescription
      currentItem = nowPlayingItem
    } else if (podcast) {
      title = ''
      time = ''
      createdById = ''
      createdByIsPublic = ''
      createdByName = ''
      description = podcast.description
      currentItem = null
    }

    return (
      <React.Fragment>
        <div className='media-info'>
          {
            title &&
            <div className='media-info__title'>
              {title}
            </div>
          }
          {
            time &&
            <div className='media-info__time'>
              {time}
            </div>
          }
          {
            createdById &&
            <div className='media-info__created-by'>
              Clip by:&nbsp;
              {
                createdByIsPublic ?
                  <Link
                    as={getLinkUserAs(createdById)}
                    href={getLinkUserHref(createdById)}>
                    <a onClick={handleLinkClick}>{createdByName}</a>
                  </Link> : createdByName
              }
            </div>
          }
          {
            (episode || mediaRef || nowPlayingItem) &&
              <div className='media-info__controls'>
                <Button
                  className={`media-info-controls__play ${playing ? 'playing' : ''}`}
                  onClick={event => {
                    if (handlePauseItem && handlePlayItem) {
                      if (playing) {
                        handlePauseItem(event)
                      } else {
                        handlePlayItem(event)
                      }
                    }
                  }}>
                  {
                    playing ?
                      <FontAwesomeIcon icon={'pause'} />
                      : <FontAwesomeIcon icon={'play'} />
                  }
                </Button>
                <Button
                  className='media-info-controls__add-to'
                  onClick={handleToggleAddToModal}>
                  <FontAwesomeIcon icon='plus' />
                </Button>
                {
                  (loggedInUserId
                    && currentItem.ownerId
                    && loggedInUserId === currentItem.ownerId) &&
                    <Button
                      className='media-info-controls__edit'
                      onClick={handleToggleMakeClipModal}>
                      <FontAwesomeIcon icon='edit' />
                    </Button>
                }
              </div>
          }
          {
            ((episode || mediaRef || nowPlayingItem) && description) &&
              <button
                className='media-info__show-more'
                onClick={this.toggleDescription}>
                <span>
                  <FontAwesomeIcon icon={showDescription ? 'caret-down' : 'caret-right'} />
                  &nbsp;More Info
                </span>
              </button>
          }
          {
            (podcast || (description && showDescription)) &&
              <div
                className='media-info__description'
                dangerouslySetInnerHTML={
                  {
                    __html: sanitizeHtml(description, {
                      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
                    })
                  }} />
          }
        </div>
      </React.Fragment>
    )
  }
}
