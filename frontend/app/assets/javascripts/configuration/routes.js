import React from 'react'
import selectn from 'selectn'
import Immutable from 'immutable'
import ProviderHelpers from 'common/ProviderHelpers'
import NavigationHelpers from 'common/NavigationHelpers'
import IntlService from 'views/services/intl'

import * as Pages from 'views/pages'
import { ServiceShortURL } from 'views/services'
import { WORKSPACES, SECTIONS } from 'common/Constants'
const intl = IntlService.instance

/**
 * Tests to see if current URL matches route.
 * Return object with matched boolean and route params returned
 *
 * Input:
 *  pathMatchArray:
 *    ['nuxeo', 'app'],
 *    ['nuxeo', 'app', 'content', { id: 'friendly_url', matcher: {} }],
 *
 *  urlPath:
 *    ['nuxeo', 'app', 'explore', 'FV', 'sections', 'Data', 'Athabascan', 'Dene', 'Dene', 'learn','words']
 *
 * Output:
 *  { matched: false, routeParams: {} }
 *  { matched: matched, routeParams: matchedRouteParams }
 */
export const matchPath = (pathMatchArray, urlPath) => {
  // Remove empties from path array, return Immutable list
  const currentPathArray = Immutable.fromJS(
    urlPath.filter((e) => {
      return e
    })
  )
  // NOTE: should this `return { matched: false, routeParams: {} }` for consistency?
  if (!pathMatchArray) {
    return false
  }

  if (pathMatchArray.size !== currentPathArray.size) {
    return { matched: false, routeParams: {} }
  }

  const matchedRouteParams = {}

  const matched = pathMatchArray.every((value, key) => {
    if (value instanceof RegExp) {
      return value.test(currentPathArray.get(key))
    } else if (value instanceof paramMatch) {
      if (value.hasOwnProperty('matcher')) {
        const testMatch = value.matcher.test(currentPathArray.get(key))

        if (testMatch) {
          matchedRouteParams[value.id] = decodeURI(currentPathArray.get(key))
          return true
        }
      }

      return false
    }
    return value === currentPathArray.get(key)
  })

  return { matched: matched, routeParams: matchedRouteParams }
}
/**
 * Parameter matching class
 */
export class paramMatch {
  constructor(id, matcher) {
    this.id = id
    this.matcher = matcher
  }
}

const PAGE_NOT_FOUND_TITLE =
  '404 - ' +
  intl.translate({
    key: 'errors.page_not_found',
    default: 'Page Not Found',
    case: 'first',
  })

const PAGE_NOT_FOUND_BODY = (
  <div>
    <p>
      {intl.translate({
        key: 'errors.report_via_feedback',
        default: 'Please report this error so that we can fix it',
        case: 'first',
      })}
      .
    </p>
    <p>
      {intl.translate({
        key: 'errors.feedback_include_link',
        default: 'Include what link or action you took to get to this page',
      })}
      .
    </p>
    <p>
      {intl.translate({
        key: 'thank_you!',
        default: 'Thank You!',
        case: 'words',
      })}
    </p>
  </div>
)

// Regex helper
const ANYTHING_BUT_SLASH = new RegExp(ProviderHelpers.regex.ANYTHING_BUT_SLASH)
const NUMBER = new RegExp(ProviderHelpers.regex.NUMBER)
const WORKSPACE_OR_SECTION = new RegExp(ProviderHelpers.regex.WORKSPACE_OR_SECTION)
//const ANY_LANGUAGE_CODE = new RegExp(ProviderHelpers.regex.ANY_LANGUAGE_CODE)
const KIDS_OR_DEFAULT = new paramMatch('siteTheme', RegExp(ProviderHelpers.regex.KIDS_OR_DEFAULT))

const WORKSPACE_TO_SECTION_REDIRECT = {
  condition: (params) => {
    // Condition 1: Guest and trying to access Workspaces
    return selectn('isConnected', params.props.computeLogin) === false && NavigationHelpers.isWorkspace(params.props)
  },
  target: (params) => {
    return '/' + params.props.splitWindowPath.join('/').replace(WORKSPACES, SECTIONS)
  },
}

const NOT_CONNECTED_REDIRECT = {
  condition: (params) => {
    return selectn('isConnected', params.props.computeLogin) === false
  },
  target: () => {
    return '/'
  },
}

// Common Paths
const DIALECT_PATH = [
  KIDS_OR_DEFAULT,
  'FV',
  new paramMatch('area', WORKSPACE_OR_SECTION),
  'Data',
  ANYTHING_BUT_SLASH,
  ANYTHING_BUT_SLASH,
  ANYTHING_BUT_SLASH,
]
const PHRASES_PATH = DIALECT_PATH.concat(['learn', 'phrases'])
const WORDS_PATH = DIALECT_PATH.concat(['learn', 'words'])
const IMMERSION_PATH = DIALECT_PATH.concat(['immersion'])
const REPORTS_PATH = DIALECT_PATH.concat(['reports'])
const PAGINATION_PATH = [new paramMatch('pageSize', NUMBER), new paramMatch('page', NUMBER)]

// Common Routes
const DIALECT_LEARN_WORDS = {
  path: WORDS_PATH,
  title:
    intl.translate({
      key: 'words',
      default: 'Words',
      case: 'words',
    }) + ' | {$dialect_name}',
  page: <Pages.PageDialectLearnWords />,
  extractPaths: true,
  redirects: [WORKSPACE_TO_SECTION_REDIRECT],
}

const DIALECT_LEARN_PHRASES = {
  path: PHRASES_PATH,
  title:
    intl.translate({
      key: 'views.pages.explore.dialect.learn.phrases.page_title',
      default: 'Phrases',
      case: 'words',
    }) + ' | {$dialect_name}',
  page: <Pages.PageDialectLearnPhrases />,
  extractPaths: true,
  redirects: [WORKSPACE_TO_SECTION_REDIRECT],
}

const DIALECT_IMMERSION_WORDS = {
  path: IMMERSION_PATH,
  title: 'Immersion', // TODOSL add locale for this
  page: <Pages.PageDialectImmersionList />,
  extractPaths: true,
  redirects: [WORKSPACE_TO_SECTION_REDIRECT],
}

const SEARCH = {
  path: [
    KIDS_OR_DEFAULT,
    'FV',
    new paramMatch('area', WORKSPACE_OR_SECTION),
    'Data',
    'search',
    new paramMatch('searchTerm', ANYTHING_BUT_SLASH),
  ],
  title:
    "'{$searchTerm}' " +
    intl.translate({
      key: 'views.pages.search.search_results',
      default: 'Search Results',
      case: 'words',
    }),
  page: <Pages.PageSearch />,
  redirects: [WORKSPACE_TO_SECTION_REDIRECT],
}
const SEARCH_DIALECT = {
  path: [
    KIDS_OR_DEFAULT,
    'FV',
    new paramMatch('area', WORKSPACE_OR_SECTION),
    'Data',
    ANYTHING_BUT_SLASH,
    ANYTHING_BUT_SLASH,
    ANYTHING_BUT_SLASH,
    'search',
    new paramMatch('searchTerm', ANYTHING_BUT_SLASH),
  ],
  title:
    "'{$searchTerm}' " +
    intl.translate({
      key: 'views.pages.search.search_results',
      default: 'Search Results',
      case: 'words',
    }) +
    ' | {$dialect_name} ',
  page: <Pages.PageSearch />,
  extractPaths: true,
  redirects: [WORKSPACE_TO_SECTION_REDIRECT],
}
const REPORT_VIEW = {
  path: REPORTS_PATH.concat(new paramMatch('reportName', ANYTHING_BUT_SLASH)),
  title:
    '{$reportName} | ' +
    intl.translate({
      key: 'reports',
      default: 'Reports',
      case: 'words',
    }) +
    ' | {$dialect_name}',
  page: <Pages.PageDialectReportsView />,
  extractPaths: true,
  redirects: [WORKSPACE_TO_SECTION_REDIRECT],
}

// Adds a pagination route to an existing route
const addPagination = (route) => {
  return Object.assign({}, route, {
    path: route.path.concat(PAGINATION_PATH),
    page: React.cloneElement(route.page, { hasPagination: true }),
    breadcrumbPathOverride: (pathArray) => {
      return pathArray.slice(0, pathArray.length - 2)
    },
  })
}

// Category page
const addCategory = (route) => {
  return Object.assign({}, route, {
    path: route.path.concat(['categories', new paramMatch('category', ANYTHING_BUT_SLASH)]),
    title:
      intl.translate({
        key: 'views.pages.explore.dialect.learn.words.page_title_category',
        default: 'Category View',
        case: 'words',
      }) +
      ' | ' +
      selectn('title', route),
    page: <Pages.PageDialectLearnWordsFilteredByCategory />,
  })
}

const addImmersionCategory = (route) => {
  return Object.assign({}, route, {
    path: route.path.concat(['categories', new paramMatch('category', ANYTHING_BUT_SLASH)]),
    title: 'Immersion Categories', // TODOSL locale translation template
  })
}

const addBrowsePhraseBook = (route) => {
  return Object.assign({}, route, {
    path: route.path.concat(['book', new paramMatch('phraseBook', ANYTHING_BUT_SLASH)]),
    title:
      intl.translate({
        key: 'views.pages.explore.dialect.learn.phrases.page_title_phrase_book',
        default: 'Browsing by Phrase Book',
        case: 'words',
      }) +
      ' | ' +
      selectn('title', route),
    page: <Pages.PageDialectLearnPhrasesFilteredByCategory />,
  })
}

const addBrowseAlphabet = (route) => {
  return Object.assign({}, route, {
    path: route.path.concat(['alphabet', new paramMatch('letter', ANYTHING_BUT_SLASH)]),
    title: '{$letter}' + ` | ${selectn('title', route)}`,
  })
}

// eg: learn/phrases/alphabet/b
const addBrowsePhraseBookByAlphabet = (route) => {
  return Object.assign({}, route, {
    path: route.path.concat(['alphabet', new paramMatch('letter', ANYTHING_BUT_SLASH)]),
    title:
      intl.translate({
        key: 'views.pages.explore.dialect.learn.phrases.page_title_phrase_book',
        default: 'Browsing Phrase Book alphabetically',
        case: 'words',
      }) +
      ' | ' +
      selectn('title', route),
  })
}

const routes = [
  {
    id: 'home',
    path: [],
    alias: ['home'],
    page: <Pages.PageHome />,
    title: intl.translate({ key: 'home', default: 'Home', case: 'first' }),
    breadcrumbs: false,
    frontpage: true,
    // redirects: [
    //   {
    //     // For any start page value other than a dialect, simple redirect to that start page
    //     condition: (params) => {
    //       return (
    //         selectn('preferences.start_page', params.props) !== undefined &&
    //         selectn('preferences.start_page', params.props) !== 'my_dialect' &&
    //         selectn('preferences.start_page', params.props) !== 'my_kids_dialect'
    //       )
    //     },
    //     target: (params) => {
    //       return UIHelpers.getPreferenceVal('start_page', params.props.preferences)
    //     },
    //   },
    //   {
    //     // Redirecting to a dialect (requires dialect_path to be provided)
    //     condition: (params) => {
    //       return selectn('preferences.primary_dialect_path', params.props) !== undefined
    //     },
    //     target: (params) => {
    //       const startPage = selectn('preferences.start_page', params.props)
    //       // const primary_dialect_path = selectn('preferences.primary_dialect_path', params.props)
    //       return (
    //         '/' +
    //         (startPage === 'my_kids_dialect' ? 'kids' : 'explore') +
    //         selectn('preferences.primary_dialect_path', params.props)
    //       )
    //     },
    //   },
    // ],
  },
  {
    id: 'dynamic_content_page',
    path: ['content', new paramMatch('friendly_url', ANYTHING_BUT_SLASH)],
    page: <Pages.PageContent area={SECTIONS} />,
    title: '{$pageTitle} | ' + intl.translate({ key: 'pages', default: 'Pages', case: 'first' }),
    breadcrumbs: false,
  },
  {
    path: ['content-preview', new paramMatch('friendly_url', ANYTHING_BUT_SLASH)],
    page: <Pages.PageContent area={WORKSPACES} />,
    title: '{$pageTitle} | ' + intl.translate({ key: 'pages', default: 'Pages', case: 'first' }),
    breadcrumbs: false,
  },
  {
    path: ['test'],
    page: <Pages.PageTest />,
    breadcrumbs: false,
  },
  {
    path: ['debug', 'end-points'],
    page: <Pages.PageDebugAPI />,
    breadcrumbs: false,
  },
  {
    path: ['debug', 'typography'],
    page: <Pages.PageDebugTypography />,
    breadcrumbs: false,
  },
  {
    path: [new paramMatch('siteTheme', new RegExp('kids'))],
    frontpage: true,
    title: intl.translate({ key: 'kids_home', default: 'Kids Home', case: 'words' }),
    page: <Pages.PageKidsHome />,
  },
  {
    path: ['play'],
    title: intl.translate({ key: 'games', default: 'Games', case: 'first' }),
    page: <Pages.PagePlay />,
  },
  {
    id: 'tasks',
    path: ['tasks'],
    title: intl.translate({ key: 'tasks', default: 'Tasks', case: 'first' }),
    page: <Pages.PageTasks />,
  },
  {
    path: ['tasks', 'users', new paramMatch('dialect', ANYTHING_BUT_SLASH)],
    title: intl.translate({ key: 'tasks', default: 'Tasks', case: 'first' }),
    page: <Pages.PageUserTasks type="users" />,
    breadcrumbs: false,
  },
  {
    path: ['register'],
    title: intl.translate({ key: 'register', default: 'Register', case: 'first' }),
    page: <Pages.PageUsersRegister />,
  },
  {
    path: ['profile'],
    title: intl.translate({ key: 'user_profile', default: 'User Profile', case: 'words' }),
    page: <Pages.PageUsersProfile />,
    redirects: [NOT_CONNECTED_REDIRECT],
    breadcrumbs: false,
  },
  {
    path: ['forgotpassword'],
    title: intl.translate({ key: 'forgot_password', default: 'Forgot Password', case: 'words' }),
    breadcrumbs: false,
    page: <Pages.PageUsersForgotPassword />,
  },
  {
    path: [KIDS_OR_DEFAULT],
    redirects: [
      {
        condition: () => {
          return true
        },
        target: () => {
          return '/explore/FV/sections/Data/'
        },
      },
    ],
  },
  {
    path: [new paramMatch('area', WORKSPACE_OR_SECTION), new paramMatch('dialectFriendlyName', ANYTHING_BUT_SLASH)],
    title: intl.translate({
      key: 'dialect_short_url',
      default: 'Dialect Short Url',
      case: 'words',
    }),
    page: <ServiceShortURL />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      't',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      new paramMatch('dialectFriendlyName', ANYTHING_BUT_SLASH),
      new paramMatch('appendPath', new RegExp('(.*)')),
    ],
    title: intl.translate({
      key: 'dialect_short_url',
      default: 'Dialect Short Url',
      case: 'words',
    }),
    page: <ServiceShortURL />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    id: 'page_explore_dialects',
    path: [KIDS_OR_DEFAULT, 'FV', new paramMatch('area', WORKSPACE_OR_SECTION), 'Data'],
    title: intl.translate({
      key: 'x_dialects',
      default: '{$siteTheme} Dialects',
      params: ['{$siteTheme}'],
    }),
    // title: '{$siteTheme} Dialects',
    page: <Pages.PageExploreDialects />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  // SEARCH
  // ------------------------------------
  SEARCH,
  addPagination(SEARCH),
  SEARCH_DIALECT,
  addPagination(SEARCH_DIALECT),
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'register',
    ],
    title:
      '{$dialect_name} ' +
      intl.translate({
        key: 'registration',
        default: 'Registration',
        case: 'words',
      }),
    page: <Pages.PageUsersRegister />,
    disableWorkspaceSectionNav: true,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      new paramMatch('language_family', ANYTHING_BUT_SLASH),
    ],
    title:
      '{$language_family_name} ' +
      intl.translate({
        key: 'explore',
        default: 'Explore',
        case: 'words',
      }),
    page: <Pages.PageExploreFamily />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    breadcrumbs: false,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
    ],
    title:
      '{$language_name} ' +
      intl.translate({
        key: 'explore',
        default: 'Explore',
        case: 'words',
      }),
    page: <Pages.PageExploreLanguage />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    breadcrumbs: false,
  },
  {
    id: 'page_explore_dialect',
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
    ],
    title:
      '{$dialect_name} ' +
      intl.translate({
        key: 'home',
        default: 'Home',
        case: 'first',
      }) +
      ' | {$siteTheme}',
    page: <Pages.PageExploreDialect />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    warnings: ['multiple_dialects'],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'edit',
    ],
    title: intl.translate({ key: 'edit', default: 'Edit', case: 'words' }) + ' {$dialect_name}',
    page: <Pages.PageExploreDialectEdit />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
    ],
    title:
      intl.translate({
        key: 'learn',
        default: 'Learn',
        case: 'words',
      }) + ' {$dialect_name}',
    page: <Pages.PageDialectLearn />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'media',
    ],
    title:
      intl.translate({
        key: 'browse_media',
        default: 'Browse Media',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: <Pages.PageDialectMedia />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'media',
      new paramMatch('media', ANYTHING_BUT_SLASH),
    ],
    title:
      '{$media} | ' +
      intl.translate({
        key: 'media',
        default: 'Media',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectViewMedia />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'media',
      new paramMatch('media', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'edit',
        default: 'Edit',
        case: 'words',
      }) +
      ' {$media} | ' +
      intl.translate({
        key: 'media',
        default: 'Media',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectEditMedia />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'alphabet',
    ],
    title:
      intl.translate({
        key: 'alphabet',
        default: 'Alphabet',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: <Pages.PageDialectViewAlphabet />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'alphabet',
      'print',
    ],
    title:
      intl.translate({
        key: 'print_alphabet',
        default: 'Print Alphabet',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: <Pages.PageDialectViewAlphabet print />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'alphabet',
      new paramMatch('character', ANYTHING_BUT_SLASH),
    ],
    title:
      intl.translate({
        key: 'character',
        default: 'Character',
        case: 'words',
      }) +
      ' - {$character} | ' +
      intl.translate({
        key: 'alphabet',
        default: 'Alphabet',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectViewCharacter />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'alphabet',
      new paramMatch('character', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'edit',
        default: 'Edit',
        case: 'words',
      }) +
      ' {$character} ' +
      intl.translate({
        key: 'character',
        default: 'Character',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'print_alphabet',
        default: 'Print Alphabet',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectAlphabetCharacterEdit />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
    ],
    title:
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: <Pages.PageDialectPlay />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
      'jigsaw',
    ],
    title:
      intl.translate({
        key: 'jigsaw',
        default: 'Jigsaw',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageJigsawGame />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
      'wordsearch',
    ],
    title:
      intl.translate({
        key: 'word_search',
        default: 'Word Search',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageWordSearch />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
      'colouringbook',
    ],
    title:
      intl.translate({
        key: 'coloring_book',
        default: 'Coloring Book',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageColouringBook />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
      'concentration',
    ],
    title:
      intl.translate({
        key: 'memory_game',
        default: 'Memory Game',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageConcentration />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
      'picturethis',
    ],
    title:
      intl.translate({
        key: 'picture_this',
        default: 'Picture This',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PagePictureThis />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
      'parachute',
    ],
    title:
      intl.translate({
        key: 'parachute',
        default: 'Parachute',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageHangman />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
      'wordscramble',
    ],
    title:
      intl.translate({
        key: 'word_scramble',
        default: 'Word Scramble',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageWordscramble />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'play',
      'quiz',
    ],
    title:
      intl.translate({
        key: 'quiz',
        default: 'Quiz',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'games',
        default: 'Games',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageQuiz />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'gallery',
    ],
    title:
      intl.translate({
        key: 'galleries',
        default: 'Galleries',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: <Pages.PageDialectGalleries />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'gallery',
      'create',
    ],
    title:
      intl.translate({
        key: 'create_gallery',
        default: 'Create Gallery',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'galleries',
        default: 'Galleries',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectGalleryCreate />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'gallery',
      new paramMatch('galleryName', ANYTHING_BUT_SLASH),
    ],
    title:
      '{$galleryName} | ' +
      intl.translate({
        key: 'galleries',
        default: 'Galleries',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectGalleryView />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'gallery',
      new paramMatch('gallery', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'edit',
        default: 'Edit',
        case: 'words',
      }) +
      ' {$galleryName} | ' +
      intl.translate({
        key: 'galleries',
        default: 'Galleries',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectGalleryEdit />,
    extractPaths: true,
  },
  {
    path: REPORTS_PATH,
    title:
      intl.translate({
        key: 'reports',
        default: 'Reports',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: <Pages.PageDialectReports />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  REPORT_VIEW,
  addPagination(REPORT_VIEW),
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'users',
    ],
    title:
      intl.translate({
        key: 'users',
        default: 'Users',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: <Pages.PageDialectUsers />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  DIALECT_LEARN_WORDS,
  addPagination(DIALECT_LEARN_WORDS),
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'words',
      'categories',
    ],
    title:
      intl.translate({
        key: 'categories',
        default: 'Categories',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'words',
        default: 'Words',
        case: 'words',
      }) +
      ' | {$dialect_name} | {$siteTheme}',
    page: <Pages.PageDialectLearnWordsCategories />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  addBrowseAlphabet(DIALECT_LEARN_WORDS),
  addPagination(addBrowseAlphabet(DIALECT_LEARN_WORDS)),
  addCategory(DIALECT_LEARN_WORDS),
  addPagination(addCategory(DIALECT_LEARN_WORDS)),
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'words',
      'create',
    ],
    title:
      intl.translate({
        key: 'create',
        default: 'Create',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'words',
        default: 'Words',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectWordsCreate />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'words',
      'create2',
    ],
    title:
      intl.translate({
        key: 'create',
        default: 'Create',
        case: 'words',
      }) +
      ', ' +
      intl.translate({
        key: 'words',
        default: 'Words',
        case: 'words',
      }) +
      ', {$dialect_name}',
    page: <Pages.CreateV2 />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'create',
      'audio',
    ],
    title: 'Create Audio, {$dialect_name}',
    page: <Pages.CreateAudio />,
    extractPaths: true,
  },
  // RECORDER
  // --------------------------------------------------
  // Recorder > Browse
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'recorders',
    ],
    title: 'Browse Recorders, {$dialect_name}',
    page: <Pages.RecorderBrowse />,
    extractPaths: true,
  },
  // Recorder > Browse (pagination)
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'recorders',
      ...PAGINATION_PATH,
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2)
      return _pathArray
    },
    title: 'Browse Recorders, {$dialect_name}',
    page: <Pages.RecorderBrowse hasPagination />,
    extractPaths: true,
  },
  // Recorder > Detail
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'recorder',
      new paramMatch('itemId', ANYTHING_BUT_SLASH),
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2, 'recorders', 'detail')
      return _pathArray
    },
    title: 'Recorder Detail, {$dialect_name}',
    page: <Pages.RecorderDetail />,
    extractPaths: true,
  },
  // Recorder > Create
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'create',
      'recorder',
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2, 'recorders', 'create')
      return _pathArray
    },
    title: 'Create Recorder, {$dialect_name}',
    page: <Pages.RecorderCreate />,
    extractPaths: true,
  },
  // Recorder > Edit
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'edit',
      'recorder',
      new paramMatch('itemId', ANYTHING_BUT_SLASH),
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 3, 3, 'recorders', 'edit')
      return _pathArray
    },
    title: 'Edit Recorder, {$dialect_name}',
    page: <Pages.RecorderEdit />,
    extractPaths: true,
  },
  // CONTRIBUTOR
  // --------------------------------------------------
  // Contributor > Browse
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'contributors',
    ],
    title: 'Browse Contributors, {$dialect_name}',
    page: <Pages.ContributorBrowse />,
    extractPaths: true,
  },
  // Contributor > Browse (pagination)
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'contributors',
      ...PAGINATION_PATH,
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2)
      return _pathArray
    },
    title: 'Browse Contributors, {$dialect_name}',
    page: <Pages.ContributorBrowse hasPagination />,
    extractPaths: true,
  },
  // Contributor > Detail
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'contributor',
      new paramMatch('itemId', ANYTHING_BUT_SLASH),
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2, 'contributors', 'detail')
      return _pathArray
    },
    title: 'Contributor Detail, {$dialect_name}',
    page: <Pages.ContributorDetail />,
    extractPaths: true,
  },
  // Contributor > Create
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'create',
      'contributor',
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2, 'contributors', 'create')
      return _pathArray
    },
    title: 'Create Contributor, {$dialect_name}',
    page: <Pages.ContributorCreate />,
    extractPaths: true,
  },
  // Contributor > Edit
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'edit',
      'contributor',
      new paramMatch('itemId', ANYTHING_BUT_SLASH),
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 3, 3, 'contributors', 'edit')
      return _pathArray
    },
    title: 'Edit Contributor, {$dialect_name}',
    page: <Pages.ContributorEdit />,
    extractPaths: true,
  },

  // PHRASEBOOK
  // --------------------------------------------------
  // Phrasebook > Browse
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'phrasebooks',
    ],
    title: 'Browse Phrasebooks, {$dialect_name}',
    page: <Pages.PhrasebookBrowse />,
    extractPaths: true,
  },
  // Phrasebook > Browse (pagination)
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'phrasebooks',
      ...PAGINATION_PATH,
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2)
      return _pathArray
    },
    title: 'Browse Phrasebooks, {$dialect_name}',
    page: <Pages.PhrasebookBrowse hasPagination />,
    extractPaths: true,
  },
  // Phrasebook > Detail
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'phrasebook',
      new paramMatch('itemId', ANYTHING_BUT_SLASH),
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2, 'phrasebooks', 'detail')
      return _pathArray
    },
    title: 'Phrasebook Detail, {$dialect_name}',
    page: <Pages.PhrasebookDetail />,
    extractPaths: true,
  },
  // Phrasebook > Create
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'create',
      'phrasebook',
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 2, 2, 'phrasebooks', 'create')
      return _pathArray
    },
    title: 'Create Phrasebook, {$dialect_name}',
    page: <Pages.PhrasebookCreate />,
    extractPaths: true,
  },
  // Phrasebook > Create V1
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'phrasebooks',
      'create',
    ],
    title:
      intl.translate({
        key: 'create',
        default: 'Create',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'phrase_book',
        default: 'Phrase Book',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectPhraseBooksCreate />,
  },
  // Phrasebook > Edit
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'edit',
      'phrasebook',
      new paramMatch('itemId', ANYTHING_BUT_SLASH),
    ],
    breadcrumbPathOverride: (pathArray) => {
      const _pathArray = [...pathArray]
      _pathArray.splice(_pathArray.length - 3, 3, 'phrasebooks', 'edit')
      return _pathArray
    },
    title: 'Edit Phrasebook, {$dialect_name}',
    page: <Pages.PhrasebookEdit />,
    extractPaths: true,
  },

  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'words',
      new paramMatch('word', ANYTHING_BUT_SLASH),
    ],
    title:
      '{$word} | ' +
      intl.translate({
        key: 'words',
        default: 'Words',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectViewWord />,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'words',
      new paramMatch('word', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'edit_x_word',
        default: 'Edit {$word} Word',
        params: ['{$word}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'words',
        default: 'Words',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectWordEdit />,
    extractPaths: true,
  },
  DIALECT_LEARN_PHRASES,
  addPagination(DIALECT_LEARN_PHRASES),
  addBrowsePhraseBook(DIALECT_LEARN_PHRASES), // NOTE: THIS IS PHRASE'S BROWSE BY CATEGORY
  addPagination(addBrowsePhraseBook(DIALECT_LEARN_PHRASES)), // NOTE: THIS IS PHRASE'S BROWSE BY CATEGORY
  addBrowsePhraseBookByAlphabet(DIALECT_LEARN_PHRASES),
  addPagination(addBrowsePhraseBookByAlphabet(DIALECT_LEARN_PHRASES)),
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'phrases',
      'categories',
    ],
    title:
      intl.translate({
        key: 'phrase_categories',
        default: 'Phrase Categories',
        case: 'words',
      }) + ' | {$dialect_name} | {$siteTheme}',
    page: <Pages.PageDialectLearnPhrasesCategories />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  addCategory(DIALECT_LEARN_PHRASES), // NOTE: This creates `.../learn/phrases/categories/[catId]` but it's not being used! `addBrowsePhraseBook` above is phrase's category view
  addPagination(addCategory(DIALECT_LEARN_PHRASES)), // NOTE: This creates `.../learn/phrases/categories/[catId]` but it's not being used! `addBrowsePhraseBook` above is phrase's category view
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'phrases',
      'create',
    ],
    title:
      intl.translate({
        key: 'create',
        default: 'Create',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'phrases',
        default: 'Phrases',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectPhrasesCreate />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'phrases',
      new paramMatch('phrase', ANYTHING_BUT_SLASH),
    ],
    title:
      '{$phrase} | ' +
      intl.translate({
        key: 'phrases',
        default: 'Phrases',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectViewPhrase />,
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'phrases',
      new paramMatch('phrase', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'views.pages.explore.dialect.phrases.edit_x_phrase',
        default: 'Edit {$phrase} Phrase',
        params: ['{$phrase}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'phrases',
        default: 'Phrases',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectPhraseEdit />,
    extractPaths: true,
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'stories',
    ],
    title:
      intl.translate({
        key: 'stories',
        default: 'Stories',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: (
      <Pages.PageDialectLearnStoriesAndSongs
        typeFilter="story"
        typePlural={intl.translate({
          key: 'stories',
          default: 'Stories',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'songs',
    ],
    title:
      intl.translate({
        key: 'songs',
        default: 'Songs',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: (
      <Pages.PageDialectLearnStoriesAndSongs
        typeFilter="song"
        typePlural={intl.translate({
          key: 'songs',
          default: 'Songs',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'songs-stories',
    ],
    title:
      intl.translate({
        key: 'songs_and_stories',
        default: 'Songs and Stories',
        case: 'words',
      }) + ' | {$dialect_name}',
    page: (
      <Pages.PageDialectLearnStoriesAndSongs
        typePlural={intl.translate({
          key: 'songs_and_stories',
          default: 'Songs and Stories',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'stories',
      'create',
    ],
    title:
      intl.translate({
        key: 'create',
        default: 'Create',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'stories',
        default: 'Stories',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectStoriesAndSongsCreate
        typeFilter="story"
        typePlural={intl.translate({
          key: 'stories',
          default: 'Stories',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'songs',
      'create',
    ],
    title:
      intl.translate({
        key: 'create',
        default: 'Create',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'songs',
        default: 'Songs',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectStoriesAndSongsCreate
        typeFilter="song"
        typePlural={intl.translate({
          key: 'songs',
          default: 'Songs',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'songs',
      new paramMatch('bookName', ANYTHING_BUT_SLASH),
    ],
    title:
      '{$bookName} | ' +
      intl.translate({
        key: 'songs',
        default: 'Songs',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectViewBook
        typeFilter="song"
        typePlural={intl.translate({
          key: 'songs',
          default: 'Songs',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'songs',
      new paramMatch('bookName', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'views.pages.explore.dialect.learn.songs_stories.edit_x_book',
        default: 'Edit {$bookName} Book',
        params: ['{$bookName}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'songs',
        default: 'Songs',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectBookEdit
        typeFilter="song"
        typePlural={intl.translate({
          key: 'songs',
          default: 'Songs',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'songs',
      new paramMatch('parentBookName', ANYTHING_BUT_SLASH),
      'create',
    ],
    title:
      intl.translate({
        key: 'create_entry',
        default: 'Create Entry',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'views.pages.explore.dialect.learn.songs_stories.x_book',
        default: '{$bookName} Book',
        params: ['{$bookName}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'songs',
        default: 'Songs',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectStoriesAndSongsBookEntryCreate
        typeFilter="song"
        typePlural={intl.translate({
          key: 'songs',
          default: 'Songs',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'songs',
      new paramMatch('parentBookName', ANYTHING_BUT_SLASH),
      new paramMatch('bookName', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'edit_entry',
        default: 'Edit Entry',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'views.pages.explore.dialect.learn.songs_stories.x_book',
        default: '{$bookName} Book',
        params: ['{$bookName}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'songs',
        default: 'Songs',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectBookEntryEdit
        typeFilter="song"
        typePlural={intl.translate({
          key: 'songs',
          default: 'Songs',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'stories',
      new paramMatch('bookName', ANYTHING_BUT_SLASH),
    ],
    title:
      intl.translate({
        key: 'views.pages.explore.dialect.learn.songs_stories.x_book',
        default: '{$bookName} Book',
        params: ['{$bookName}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'stories',
        default: 'Stories',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectViewBook
        typeFilter="story"
        typePlural={intl.translate({
          key: 'stories',
          default: 'Stories',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      new paramMatch('area', WORKSPACE_OR_SECTION),
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'stories',
      new paramMatch('bookName', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'views.pages.explore.dialect.learn.songs_stories.edit_x_book',
        default: 'Edit {$bookName} Book',
        params: ['{$bookName}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'stories',
        default: 'Stories',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectBookEdit
        typeFilter="story"
        typePlural={intl.translate({
          key: 'stories',
          default: 'Stories',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'stories',
      new paramMatch('parentBookName', ANYTHING_BUT_SLASH),
      'create',
    ],
    title:
      intl.translate({
        key: 'create_entry',
        default: 'Create Entry',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'views.pages.explore.dialect.learn.songs_stories.x_book',
        default: '{$bookName} Book',
        params: ['{$bookName}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'stories',
        default: 'Stories',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectStoriesAndSongsBookEntryCreate
        typeFilter="story"
        typePlural={intl.translate({
          key: 'stories',
          default: 'Stories',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'stories',
      new paramMatch('parentBookName', ANYTHING_BUT_SLASH),
      new paramMatch('bookName', ANYTHING_BUT_SLASH),
      'edit',
    ],
    title:
      intl.translate({
        key: 'edit_entry',
        default: 'Edit Entry',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'views.pages.explore.dialect.learn.songs_stories.x_book',
        default: '{$bookName} Book',
        params: ['{$bookName}'],
      }) +
      ' | ' +
      intl.translate({
        key: 'stories',
        default: 'Stories',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: (
      <Pages.PageDialectBookEntryEdit
        typeFilter="story"
        typePlural={intl.translate({
          key: 'stories',
          default: 'Stories',
          case: 'words',
        })}
      />
    ),
    extractPaths: true,
    redirects: [WORKSPACE_TO_SECTION_REDIRECT],
  },
  {
    path: [
      KIDS_OR_DEFAULT,
      'FV',
      WORKSPACES,
      'Data',
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      ANYTHING_BUT_SLASH,
      'learn',
      'categories',
      'create',
    ],
    title:
      intl.translate({
        key: 'create',
        default: 'Create',
        case: 'words',
      }) +
      ' | ' +
      intl.translate({
        key: 'category',
        default: 'Category',
        case: 'words',
      }) +
      ' | {$dialect_name}',
    page: <Pages.PageDialectCategoryCreate />,
    extractPaths: true,
  },
  // Onboarding Route (Won't merge to master)
  {
    path: [KIDS_OR_DEFAULT, 'FV', 'SharedCategories'],
    title: 'Shared Categories',
    page: <Pages.Categories />,
    extractPaths: true,
  },

  {
    path: ['404-page-not-found'],
    title: PAGE_NOT_FOUND_TITLE,
    page: <Pages.PageError title={PAGE_NOT_FOUND_TITLE} body={PAGE_NOT_FOUND_BODY} />,
  },
  DIALECT_IMMERSION_WORDS,
  addPagination(DIALECT_IMMERSION_WORDS),
  addImmersionCategory(DIALECT_IMMERSION_WORDS),
  addPagination(addImmersionCategory(DIALECT_IMMERSION_WORDS)),
]

export default routes
