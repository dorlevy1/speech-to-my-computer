const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './index.ts', // הקובץ הראשי שלך
    target: 'electron-main', // פרויקט Electron
    externals: [nodeExternals()], // אי הכללת node_modules
    module: {
        rules: [
            {
                test: /\.ts$/, // לכלול את כל הקבצים עם סיומת .ts
                use: 'ts-loader', // שימוש ב-ts-loader כדי לטפל ב-TypeScript
                exclude: /node_modules/ // לא לכלול את node_modules
            },
        ],
    },
    resolve: {
        alias: {
            '@chatFactory': path.resolve(__dirname, "./src/factories/chat"),
            '@speechFactory': path.resolve(__dirname, "./src/factories/speech"),
            '@factories': path.resolve(__dirname, "./src/factories"),
            '@utils': path.resolve(__dirname, "./src/utils"),
            '@enums': path.resolve(__dirname, "./src/enums"),
            '@types': path.resolve(__dirname, "./src/@types"),
            '@strategies': path.resolve(__dirname, "./src/Strategies"),
        },
        extensions: ['.ts', '.js'], // סוגי הקבצים שהמערכת תטפל בהם
    },
    output: {
        filename: '[name].js', // קובץ פלט אחרי הבנייה
        path: path.resolve(__dirname, 'dist'), // תיקיית פלט
        clean: true, // מנקה את תיקיית הפלט לפני כל בנייה מחדש

    },
    plugins: [
        // העתקת קבצים סטטיים כמו HTML ותמונות
        new CopyWebpackPlugin({
            patterns: [
                // מעתיק את כל הקבצים בתיקיית src כמו שהם
                {
                    from: 'src',
                    to: 'src',
                    globOptions: {
                        ignore: ['**/*.ts'], // לא להעתיק קבצי TypeScript, הם כבר מומרים ל-JavaScript
                    },
                },
                {from: '*.html', to: '[name][ext]'}, // העתקת קבצי HTML אם הם בשורש
            ],
        }),
    ],
    mode: 'development', // אפשר להחליף ל'production' בבנייה סופית
};
