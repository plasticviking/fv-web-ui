// NOTE: These custom hooks are extracting data from Redux
import useRouteParams from './useRouteParams'
import useSearchParams from './useSearchParams'

function wordsDataHooks(props) {
  // NOTE: We now have flexibility to add/remove data sources from Redux
  const { page, pageSize, setParams } = useRouteParams()
  const { sortBy, sortOrder, testing } = useSearchParams()
  return props.children({
    routeParamsPage: page,
    routeParamsPageSize: pageSize,
    routeParamsSet: setParams,
    routeParamsTesting: testing,
    searchParamsSortBy: sortBy,
    searchParamsSortOrder: sortOrder,
    searchParamsTesting: testing,
  })
}
export default wordsDataHooks
