import * as React from 'react'
import FilePlayer from 'react-player/lib/players/FilePlayer'
import { Progress } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as ReactTooltip from 'react-tooltip'
import { keyLeftArrow, keyRightArrow } from 'lib/constants'
import { NowPlayingItem } from 'lib/nowPlayingItem'
import { convertSecToHHMMSS, readableClipTime } from 'lib/util'
import { AddToModal } from './AddToModal/AddToModal'
import MakeClipModal from './MakeClipModal/MakeClipModal'
import { QueueModal } from './QueueModal/QueueModal'
import ShareModal from './ShareModal/ShareModal'
// import { getPriorityQueueItems, getSecondaryQueueItems } from 'lib/mediaPlayerQueue';

type Props = {
  autoplay?: boolean
  handleItemSkip?: (event: React.MouseEvent<HTMLButtonElement>) => void
  handleMakeClip?: Function
  handleOnEpisodeEnd?: Function
  handleOnPastClipTime?: Function
  handlePlaylistCreate?: Function
  handlePlaylistItemAdd?: Function
  handleToggleAutoplay?: (event: React.MouseEvent<HTMLButtonElement>) => void
  handleTogglePlay?: (event: React.MouseEvent<HTMLButtonElement>) => void
  nowPlayingItem: NowPlayingItem
  playbackRate?: number
  playerClipLink?: string
  playerEpisodeLink?: string
  playerPodcastLink?: string
  playing?: boolean
  showAutoplay?: boolean
}

type State = {
  clipEndFlagPositionX?: number
  clipFinished: boolean
  clipStartFlagPositionX?: number
  duration: number | null
  isClientSide: boolean
  isLoading: boolean
  openAddToModal: boolean
  openMakeClipModal: boolean
  openQueueModal: boolean
  openShareModal: boolean
  playbackRate: number
  played: number
  playedSeconds: number
  progressPreviewTime: number
  seeking: boolean
}

type ClipFlagPositions = {
  clipEndFlagPositionX?: number
  clipStartFlagPositionX?: number
}

export interface MediaPlayer {
  durationNode: any
  player: any
  progressBarWidth: any
}

const getPlaybackRateText = num => {
  switch (num) {
    case 0.5:
      return '0.5x'
    case 0.75:
      return '0.75x'
    case 1:
      return '1x'
    case 1.25:
      return '1.25x'
    case 1.5:
      return '1.5x'
    case 2:
      return '2x'
    default:
      return '1x'
  }
}

const changePlaybackRate = num => {
  switch (num) {
    case 0.5:
      return 0.75
    case 0.75:
      return 1
    case 1:
      return 1.25
    case 1.25:
      return 1.5
    case 1.5:
      return 2
    case 2:
      return 0.5
    default:
      return 1
  }
}

const timePlaceholder = '--:--:--'

// Force ReactPlayer to refresh every time the mediaUrl changes, to ensure
// playback behavior handles properly.
let mediaUrl
let reactPlayerKey = 0
const incrementReactPlayerKey = () => reactPlayerKey++
const hasMediaUrlChanged = (newUrl) => {
  if (!mediaUrl) {
    mediaUrl = newUrl
    return false
  } else {
    const hasChanged = mediaUrl !== newUrl
    mediaUrl = newUrl
    return hasChanged
  }
}

export class MediaPlayer extends React.Component<Props, State> {

  static defaultProps: Props = {
    nowPlayingItem: {},
    playbackRate: 1,
    playing: false,
    showAutoplay: true
  }

  constructor (props) {
    super(props)

    this.state = {
      clipEndFlagPositionX: -1,
      clipFinished: false,
      clipStartFlagPositionX: -1,
      duration: null,
      isClientSide: false,
      isLoading: true,
      openAddToModal: false,
      openMakeClipModal: false,
      openQueueModal: false,
      openShareModal: false,
      playbackRate: props.playbackRate || 1,
      played: 0,
      playedSeconds: 0,
      progressPreviewTime: -1,
      seeking: false
    }

    this.durationNode = React.createRef()
    this.progressBarWidth = React.createRef()

    this.handleTimeJumpForward = this.handleTimeJumpForward.bind(this)
  }

  componentDidMount () {
    this.setKeyboardEventListeners()
    this.setState({ isClientSide: true })
  }

  setKeyboardEventListeners () {
    document.body.addEventListener('keydown', (event) => {
      if (event.keyCode === keyLeftArrow) {
        this.player.seekTo(this.player.getCurrentTime() - 5)
      } else if (event.keyCode === keyRightArrow) {
        this.player.seekTo(this.player.getCurrentTime() + 5)
      }
    })
  }

  playerRef = player => {
    this.player = player
  }

  setCurrentTime = e => {
    const offsetX = e.nativeEvent.offsetX
    const width = e.currentTarget.offsetWidth
    this.player.seekTo(offsetX / width)
  }

  setPlaybackRate = e => {
    this.setState({
      playbackRate: changePlaybackRate(this.state.playbackRate)
    })
  }

  getClipFlagPositions = (): ClipFlagPositions => {
    const { nowPlayingItem } = this.props
    const { clipEndTime, clipStartTime } = nowPlayingItem
    const { duration } = this.state

    let clipEndFlagPositionX = -1
    let clipStartFlagPositionX = -1

    if (this.progressBarWidth.current) {
      const width = this.progressBarWidth.current.offsetWidth

      if (duration && duration > 0 && this.durationNode && this.durationNode.current && this.durationNode.current.innerText !== timePlaceholder) {
        const positionOffset = width / duration

        if (clipStartTime) {
          clipStartFlagPositionX = (clipStartTime * positionOffset) - 1
        }

        if (clipStartTime && clipEndTime) {
          clipEndFlagPositionX = (clipEndTime * positionOffset) + 1
        }
      }
    }

    return {
      clipEndFlagPositionX,
      clipStartFlagPositionX
    }
  }

  handleTimeJumpForward = () => {
    this.player.seekTo(this.player.getCurrentTime() + 15)
  }

  handleItemSkip = (evt) => {
    if (this.props.handleItemSkip) {
      this.setState({
        duration: 0,
        isLoading: true,
        played: 0,
        playedSeconds: 0
      })
      this.props.handleItemSkip(evt)
    }
  }

  onDuration = (duration) => {
    const { nowPlayingItem } = this.props
    const { clipStartTime } = nowPlayingItem

    this.setState({
      duration,
      isLoading: false
    })

    if (clipStartTime && clipStartTime > 0) {
      this.player.seekTo(clipStartTime)
    }
  }

  onPlay = () => {
    const { handleOnPastClipTime, nowPlayingItem } = this.props
    const { clipEndTime } = nowPlayingItem
    const { clipFinished } = this.state

    if (clipEndTime && clipFinished && this.player.getCurrentTime() > clipEndTime && handleOnPastClipTime) {
      handleOnPastClipTime()
      return
    }
  }

  onMouseOverProgress = e => {
    const offsetX = e.nativeEvent.offsetX
    const width = e.currentTarget.offsetWidth
    const { duration } = this.state

    if (duration) {
      const previewTime = duration * (offsetX / width)
      this.setState({
        progressPreviewTime: previewTime
      })
    }
  }

  onMouseOutProgress = e => {
    this.setState({
      progressPreviewTime: -1
    })
  }

  onSeekMouseDown = e => {
    this.setState({ seeking: true })
  }

  onSeekMouseUp = e => {
    this.setState({ seeking: false })
  }

  onProgress = state => {
    const { nowPlayingItem } = this.props
    const { clipEndTime } = nowPlayingItem
    const { clipFinished, seeking } = this.state

    if (clipEndTime && !clipFinished && this.player.getCurrentTime() > clipEndTime) {
      this.setState({
        clipFinished: true
      })
      return
    }

    if (!seeking) {
      this.setState(state)
    }
  }

  toggleAddToModal = () => {
    this.setState({ openAddToModal: !this.state.openAddToModal })
  }

  toggleMakeClipModal = () => {
    this.setState({ openMakeClipModal: !this.state.openMakeClipModal })
  }

  toggleQueueModal = () => {
    this.setState({ openQueueModal: !this.state.openQueueModal })
  }

  toggleShareModal = () => {
    this.setState({ openShareModal: !this.state.openShareModal })
  }

  hideAddToModal = () => {
    this.setState({ openAddToModal: false })
  }

  hideMakeClipModal = () => {
    this.setState({ openMakeClipModal: false })
  }

  hideQueueModal = () => {
    this.setState({ openQueueModal: false })
  }

  hideShareModal = () => {
    this.setState({ openShareModal: false })
  }

  render () {
    const { autoplay, handleMakeClip, handleOnEpisodeEnd, handleToggleAutoplay,
      handleTogglePlay, nowPlayingItem, playerClipLink, playerEpisodeLink,
      playerPodcastLink, playing, showAutoplay } = this.props

    const { duration, isClientSide, isLoading, openAddToModal, openMakeClipModal,
      openQueueModal, openShareModal, playbackRate, progressPreviewTime } = this.state

    const { clipEndTime, clipStartTime, clipTitle, episodeMediaUrl, episodeTitle,
      imageUrl, podcastTitle } = nowPlayingItem

    // Force ReactPlayer to reload if it receives a new mediaUrl, set loading state,
    // and clear clip flags.
    if (hasMediaUrlChanged(episodeMediaUrl)) {
      incrementReactPlayerKey()
    }

    let { clipEndFlagPositionX, clipStartFlagPositionX } = this.getClipFlagPositions()
    const currentTime = this.player ? this.player.getCurrentTime() : 0

    return (
      <div className='mp'>
        {
          isClientSide &&
            <FilePlayer
              key={reactPlayerKey}
              muted={false}
              onDuration={this.onDuration}
              onEnded={handleOnEpisodeEnd}
              onPlay={this.onPlay}
              onProgress={this.onProgress}
              playbackRate={playbackRate}
              playing={playing}
              ref={this.playerRef}
              style={{ display: 'none' }}
              url={episodeMediaUrl}
              volume={1} />
        }
        <div className='mp__headline'>
          <div className='mp-headline__inner'>
            <a
              className='mp-headline__link'
              { ... playerClipLink &&
                { href: playerClipLink }
              }>
              <div className='mp-headline__title'>
                {clipTitle}
              </div>
              <div className='mp-headline__time'>
                {readableClipTime(clipStartTime, clipEndTime)}
              </div>
            </a>
          </div>
        </div>
        <div className='mp__header'>
          <div className='mp-header__inner'>
            <a
              className='mp-header__link'
              {
                ... playerEpisodeLink &&
                  { href: playerEpisodeLink }
              }>
              <img
                className='mp-header__image'
                src={imageUrl} />
              <div className='mp-header__wrap'>
                <div className='mp-header-wrap__top'>
                  {podcastTitle}
                </div>
                <div className='mp-header-wrap__bottom'>
                  {episodeTitle}
                </div>
              </div>
            </a>
            <button
              className={`mp-header__add ${openAddToModal ? 'active' : ''}`}
              onClick={this.toggleAddToModal}>
              <FontAwesomeIcon icon='plus-circle' />
            </button>
            {
              handleMakeClip &&
                <button
                  className={`mp-header__clip ${openMakeClipModal ? 'active' : ''}`}
                  onClick={this.toggleMakeClipModal}>
                  <FontAwesomeIcon icon='cut' />
                </button>
            }
            <button
              className={`mp-header__queue ${openQueueModal ? 'active' : ''}`}
              onClick={this.toggleQueueModal}>
              <FontAwesomeIcon icon='list-ul' />
            </button>
            <button
              className={`mp-header__share ${openShareModal ? 'active' : ''}`}
              onClick={this.toggleShareModal}>
              <FontAwesomeIcon icon='share' />
            </button>
          </div>
        </div>
        <div className='mp__player'>
          <div className='mp-player__inner'>
            <button
              className='mp-player__play-pause'
              onClick={handleTogglePlay}>
              {
                playing ?
                  <FontAwesomeIcon icon='pause' /> :
                  <FontAwesomeIcon icon='play' />
              }
            </button>
            <div
              className='mp-player__progress-bar-wrapper'
              data-iscapture='true'
              data-tip
              ref={this.progressBarWidth}>
              {
                (!isLoading && duration) &&
                  <span className={`mp-player__current-time`}>
                    {convertSecToHHMMSS(this.player.getCurrentTime())}
                  </span>
              }
              <div
                className='mp-progress-bar__clip-start'
                style={{
                  display: `${clipStartFlagPositionX! > -1 && duration ? 'block' : 'none'}`,
                  left: `${clipStartFlagPositionX}px`
                }} />
              <div
                className='mp-progress-bar__clip-end'
                style={{
                  display: `${clipEndFlagPositionX! > -1 && duration ? 'block' : 'none'}`,
                  left: `${clipEndFlagPositionX}px`
                }} />
              <ReactTooltip
                className='mp-progress-bar__preview'>
                {convertSecToHHMMSS(progressPreviewTime)}
              </ReactTooltip>
              <Progress
                className='mp-player__progress-bar'
                onClick={this.setCurrentTime}
                onMouseMove={this.onMouseOverProgress}
                value={duration && this.player ? (this.player.getCurrentTime() / duration) * 100 : 0} />
              {
                (!isLoading && duration) &&
                  <span
                    className={`mp-player__duration`}
                    ref={this.durationNode}>
                    {convertSecToHHMMSS(duration)}
                  </span>
              }
            </div>
            <button
              className='mp-player__time-jump-forward'
              onClick={this.handleTimeJumpForward}>
              <FontAwesomeIcon icon='redo-alt' />
            </button>
            <button
              className='mp-player__playback-rate'
              onClick={this.setPlaybackRate}>
              {getPlaybackRateText(playbackRate)}
            </button>
            {
              (showAutoplay) &&
              <button
              className={`mp-player__autoplay ${autoplay ? 'active' : ''}`}
              onClick={handleToggleAutoplay}>
                  <FontAwesomeIcon icon='infinity' />
                </button>
            }
            <button
              className='mp-player__skip'
              onClick={this.handleItemSkip}>
              <FontAwesomeIcon icon='step-forward' />
            </button>
          </div>
        </div>
        {
          openAddToModal &&
            <AddToModal
              hideModal={this.hideAddToModal}
              isOpen={openAddToModal} />

        }
        {
          (openMakeClipModal && handleMakeClip) &&
            <MakeClipModal
              handleSubmit={handleMakeClip}
              hideModal={this.hideMakeClipModal}
              isPublic={true}
              isOpen={openMakeClipModal}
              startTime={currentTime} />
        }
        <QueueModal
          hideModal={this.hideQueueModal}
          isOpen={openQueueModal} />
        <ShareModal
          hideModal={this.hideShareModal}
          isOpen={openShareModal}
          playerClipLink={playerClipLink}
          playerEpisodeLink={playerEpisodeLink}
          playerPodcastLink={playerPodcastLink} />
      </div>
    )
  }
}
