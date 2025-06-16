import { Route, Routes } from 'react-router-dom'
import routes from './routes/routes'
import PermissionCheck from './components/Permission/PermissionCheck'
import NotFound from './components/NotFound/NotFound'
import { useAutoLogout } from './hooks/useAutoLogout'

function App() {
  useAutoLogout()

  return (
    <Routes>
      {routes.map((route, i) => {
        const Layout = route.layout
        return (
          <Route key={i} element={<Layout />}>
            {route.data.map((item) => {
              const Component = item.component
              return (
                <Route
                  key={item.path}
                  path={item.path}
                  element={
                    <PermissionCheck protectedRole={item.role}>
                      <Component />
                    </PermissionCheck>
                  }
                />
              )
            })}
          </Route>
        )
      })}

      {/* Trang fallback */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
