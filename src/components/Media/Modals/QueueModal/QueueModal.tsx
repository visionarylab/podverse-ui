import * as React from 'react'
import * as Modal from 'react-modal'
import { CloseButton } from 'components/CloseButton/CloseButton'
import { MediaListItem } from 'components/Media/MediaListItem/MediaListItem'

export interface Props {
  handleAnchorOnClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  hideModal: (event: React.MouseEvent<HTMLButtonElement>) => void
  isOpen: boolean
  priorityItems: any[]
  secondaryItems: any[]
}

const defaultProps: Props = {
  hideModal: () => { console.log('hideModal') },
  isOpen: false,
  priorityItems: [],
  secondaryItems: []
}

const customStyles = {
  content: {
    bottom: 'unset',
    height: 'calc(100% - 72px)',
    left: '50%',
    maxWidth: '480px',
    right: 'unset',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%'
  }
}

const QueueModal: React.StatelessComponent<Props> = props => {
  const { handleAnchorOnClick, hideModal, isOpen, priorityItems, secondaryItems } = props

  const priorityItemNodes = priorityItems.map(x => {
    if (x.clipStartTime) {
      return (
        <MediaListItem
          dataNowPlayingItem={x}
          handleAnchorOnClick={handleAnchorOnClick}
          itemType='now-playing-item' />
      )
    } else {
      return (
        <MediaListItem
          dataNowPlayingItem={x}
          handleAnchorOnClick={handleAnchorOnClick}
          itemType='now-playing-item' />
      )
    }
  })

  const secondaryItemNodes = secondaryItems.map(x => {
    if (x.clipStartTime) {
      return (
        <MediaListItem
          dataNowPlayingItem={x}
          handleAnchorOnClick={handleAnchorOnClick}
          itemType='now-playing-item' />
      )
    } else {
      return (
        <MediaListItem
          dataNowPlayingItem={x}
          handleAnchorOnClick={handleAnchorOnClick}
          itemType='now-playing-item' />
      )
    }
  })

  return (
    <Modal
      contentLabel='Queue'
      isOpen={isOpen}
      onRequestClose={hideModal}
      portalClassName='mp-queue-modal over-media-player'
      shouldCloseOnOverlayClick
      style={customStyles}>
      <h5>Queue</h5>
      <CloseButton onClick={hideModal} />
      <div className='scrollable-area'>
        {
          priorityItemNodes.length > 0 &&
            <React.Fragment>
              <h6>Next Up</h6>
              {priorityItemNodes}
            </React.Fragment>
        }
        {
          secondaryItemNodes.length > 0 &&
            <React.Fragment>
              <h6>Auto Queue</h6>
              {secondaryItemNodes}
            </React.Fragment>
        }
      </div>
    </Modal>
  )
}

QueueModal.defaultProps = defaultProps

export default QueueModal