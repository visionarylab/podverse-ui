import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { text } from '@storybook/addon-knobs'
import { MediaInfo } from './MediaInfo'

import { sampleMediaRef1 } from 'storybook/constants'
const { episodeDescription, title } = sampleMediaRef1

storiesOf('Media', module)
  .addWithJSX(
    'MediaInfo',
    () => (
      <MediaInfo
        clipReadableTime='12:34 - 14:56'
        clipTime={1234}
        clipTitle={text('clipTitle', title)}
        description={text('description', episodeDescription)}
        handleClipReadableTimeOnClick
        isEpisode={false} />
    )
  )