import React from 'react'
import useIcon from 'common/useIcon'
import PropTypes from 'prop-types'
/**
 * @summary SharePresentation
 * @version 1.0.1
 * @component
 *
 * @param {object} props
 *
 * @returns {node} jsx markup
 */
function SharePresentation({ url, title }) {
  return (
    <ul>
      {navigator.share ? (
        <li className="m-2 h-9 w-9 inline-flex items-center align-center text-white rounded bg-fv-purple">
          <button
            onClick={() =>
              navigator.share({
                title: title,
                url: url,
              })
            }
          >
            {useIcon('WebShare', 'fill-current h-6 w-6 ml-1.5')}
          </button>
        </li>
      ) : null}
      <li className="m-2 h-9 w-9 inline-flex items-center align-center text-white rounded bg-blue-300">
        <a href={`https://twitter.com/intent/tweet?url=${url}&text=${title}`}>
          {useIcon('Twitter', 'fill-current h-6 w-6 ml-1.5')}
        </a>
      </li>
      <li className="m-2 h-9 w-9 inline-flex items-center align-center text-white rounded bg-blue-900">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}>
          {useIcon('Facebook', 'fill-current h-6 w-6 ml-1.5')}
        </a>
      </li>
      <li className="m-2 h-9 w-9 inline-flex items-center align-center text-white rounded bg-blue-700">
        <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`}>
          {useIcon('LinkedIn', 'fill-current h-6 w-6 ml-1.5')}
        </a>
      </li>
      <li className="m-2 h-9 w-9 inline-flex items-center align-center text-white rounded bg-fv-red">
        <a href={`mailto:?subject=${title}&body=${url}`}>{useIcon('Mail', 'fill-current h-6 w-6 ml-1.5')}</a>
      </li>
    </ul>
  )
}
// PROPTYPES
const { string } = PropTypes
SharePresentation.propTypes = {
  url: string,
  title: string,
}

export default SharePresentation
