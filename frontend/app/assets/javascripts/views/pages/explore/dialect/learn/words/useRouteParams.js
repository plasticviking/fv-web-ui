import { useDispatch, useSelector } from 'react-redux'
import { setRouteParams } from 'providers/redux/reducers/navigation'
function useRouteParams() {
  // NOTE: We don't want to add the Redux useSelector to all of our React components
  // It would couple dependencies (React & Redux) and increase Stamp Coupling
  //
  // So that's why we are using a custom hook to extract the Redux data
  const routeParams = useSelector((state) => state.navigation.route.routeParams)
  const dispatch = useDispatch()
  const setParams = (data) => {
    const dispatchObj = setRouteParams(data)
    dispatch(dispatchObj)
  }
  return { ...routeParams, setParams }
}
export default useRouteParams
