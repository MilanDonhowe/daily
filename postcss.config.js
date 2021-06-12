// this file configures postcss to use tailwind
// postcss is a generalized preprocessor for css
// here it is configured to run well with tailwind.css
module.exports = {
    plugins: [
        require('postcss-import'),
        require('tailwindcss'),
        require('autoprefixer')
    ]
}