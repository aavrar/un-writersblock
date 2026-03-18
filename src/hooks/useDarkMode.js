import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useDarkMode() {
    const [theme, setTheme] = useLocalStorage('theme', 'light')

    useEffect(() => {
        const root = window.document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
    }, [theme])

    function toggleTheme() {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
    }

    return [theme === 'dark', toggleTheme]
}
