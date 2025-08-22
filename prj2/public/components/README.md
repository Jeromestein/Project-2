# Header and Footer Components

This directory contains reusable header and footer components for the TechBlog Hub website.

## File Structure

```
components/
├── header.html      # Header navigation component
├── footer.html      # Footer component
└── README.md        # This file
```

## How to Use

### 1. Include the Components

In any HTML page, add these container elements:

```html
<!-- Header Container -->
<div id="header-container"></div>

<!-- Your page content here -->

<!-- Footer Container -->
<div id="footer-container"></div>
```

### 2. Include the JavaScript

Add the components.js script to your page:

```html
<script src="/js/components.js"></script>
```

### 3. Required Dependencies

Make sure your page includes these dependencies:

```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Font Awesome -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<!-- Custom CSS -->
<link href="/css/style.css?v=1.1" rel="stylesheet">

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

## Example Page Structure

See `template.html` for a complete example of how to structure a page with these components.

## Benefits

- **Reusability**: Header and footer can be used across all pages
- **Maintainability**: Changes to header/footer only need to be made in one place
- **Consistency**: Ensures all pages have the same header and footer
- **Modularity**: Easy to update or replace components independently

## Customization

To modify the header or footer:

1. Edit the respective HTML file in the `components/` directory
2. Changes will automatically apply to all pages that use these components

## Notes

- Components are loaded asynchronously when the DOM is ready
- If a component fails to load, an error will be logged to the console
- The header includes navigation links to Home and Contact pages
- The footer includes company information, social links, and navigation
