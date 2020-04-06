import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'

import FVLabel from '../FVLabel/index'

const { array, func, string } = PropTypes
export class AlphabetListView extends Component {
  static propTypes = {
    characters: array,
    dialectClassName: string,
    handleClick: func,
    letter: string,
    splitWindowPath: array.isRequired,
  }
  static defaultProps = {
    handleClick: () => {},
  }

  _isMounted = false

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this._isMounted = true
    window.addEventListener('popstate', this.handleHistoryEvent)
  }

  componentWillUnmount() {
    this._isMounted = false
    window.removeEventListener('popstate', this.handleHistoryEvent)
  }

  render() {
    let content = null
    if (this.props.characters === undefined) {
      content = this.componentIsLoading()
    } else {
      if (this.props.characters.length === 0) {
        content = this.componentHasNoContent()
      } else {
        content = this.componentHasContent()
      }
    }
    return (
      <div className="AlphabetListView" data-testid="AlphabetListView">
        <h2>
          <FVLabel
            transKey="views.pages.explore.dialect.learn.words.find_by_alphabet"
            defaultStr="Browse Alphabetically"
            transform="words"
          />
        </h2>
        {content}
      </div>
    )
  }

  generateDialectFilterUrl = (letter) => {
    let href = undefined
    const _splitWindowPath = [...this.props.splitWindowPath]
    const wordOrPhraseIndex = _splitWindowPath.findIndex((element) => {
      return element === 'words' || element === 'phrases'
    })
    if (wordOrPhraseIndex !== -1) {
      _splitWindowPath.splice(wordOrPhraseIndex + 1)
      href = `/${_splitWindowPath.join('/')}/alphabet/${letter}`
    }
    return href
  }

  handleHistoryEvent = () => {
    if (this._isMounted) {
      if (this.props.letter) {
        this.props.handleClick(this.props.letter, false)
      }
    }
  }

  componentIsLoading = () => {
    return (
      <div className="AlphabetListView__loading">
        <CircularProgress className="AlphabetListView__loadingSpinner" color="secondary" mode="indeterminate" />
        <Typography className="AlphabetListView__loadingText" variant="caption">
          Loading characters
        </Typography>
      </div>
    )
  }

  componentHasNoContent = () => {
    return (
      <Typography className="AlphabetListView__noCharacters" variant="caption">
        Characters are unavailable at this time
      </Typography>
    )
  }

  componentHasContent = () => {
    const { characters = [] } = this.props
    const { letter } = this.props
    const _characters = characters.map((value, index) => {
      const _letter = value.title
      const href = this.generateDialectFilterUrl(_letter)
      return (
        <a
          href={href}
          className={`AlphabetListViewTile ${letter === _letter ? 'AlphabetListViewTile--active' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            this.props.handleClick(_letter, href)
          }}
          key={index}
        >
          {_letter}
        </a>
      )
    })
    let content = null
    if (_characters.length > 0) {
      content = <div className={`AlphabetListViewTiles ${this.props.dialectClassName}`}>{_characters}</div>
    }
    return content
  }
}

export default AlphabetListView
