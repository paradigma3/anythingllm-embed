import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import tailwindConfig from './tailwind.config.js'
import postcssNesting from 'postcss-nesting';
export default {
  plugins: [
    postcssNesting, 
    tailwind(tailwindConfig),
    autoprefixer,
  ],
}