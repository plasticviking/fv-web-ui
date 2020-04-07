import { useSelector } from 'react-redux'
function useSearchParams() {
  // NOTE: We don't want to add the Redux useSelector to all of our React components
  // It would couple dependencies (React & Redux) and increase Stamp Coupling
  //
  // So that's why we are using a custom hook to extract the Redux data
  const params = useSelector((state) => state.navigation.route.search)
  return params
}
export default useSearchParams
