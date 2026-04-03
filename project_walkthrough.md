# Modern Bengali Digital Clock Component

The "Bangla Digital Clock" is a premium, minimal UI component designed for modern web interfaces. It combines glassmorphism, neon-glow aesthetics, and localized Bengali formatting.

## Key Features

- **Bengali Numerals**: Automatically converts standard digits to Bengali (০১২৩৪৫৬৭৮৯).
- **Glassmorphism**: A frosted glass container with `backdrop-filter: blur()`.
- **Neon Aesthetic**: Soft glowing text shadows and animated background decorative circles for depth.
- **Dynamic Date**: Displays the day, date, month, and year in full Bengali format.
- **12/24 Hour Toggle**: User-selectable time format with a smooth transition.
- **Responsive Design**: Adapts seamlessly to laptops, tablets, and mobile devices.

## Files Created

- [index.html](file:///Applications/XAMPP/xamppfiles/htdocs/Test%201/Ai/index.html): Core structure and Google Fonts integration.
- [style.css](file:///Applications/XAMPP/xamppfiles/htdocs/Test%201/Ai/style.css): Premium styling, glass effects, and animations.
- [script.js](file:///Applications/XAMPP/xamppfiles/htdocs/Test%201/Ai/script.js): Localization logic and real-time updating.

## Implementation Details

The clock uses the `Hind Siliguri` font family for high-quality Bengali typography. The numbers are updated via a custom JavaScript mapping, ensuring that the transition between digits is smooth using CSS `transform` and `opacity` animations.

```javascript
const banglaDigits = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};
```

The background features animated "floating" circles with heavy blur to create a rich, atmospheric feel without cluttering the main interface.
