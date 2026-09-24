# Dravon experience upgrade

## Scope

- New editorial home page with original Web3 imagery, product collection, linked feature cards, onboarding, expandable FAQ and full footer.
- Consistent navy/blue/silver visual system in dark and light themes across existing routes.
- New dashboard, user, preferences and learning headers; account quick actions; clearer disconnected-wallet state.
- Product catalog with combined category and text filters, result counts, reset state, expandable details and featured services. Existing product availability labels remain intact. Admin entries follow the existing admin-wallet visibility check.
- Grouped desktop navigation, a focus-trapped mobile dialog, four mobile shortcuts and an assistant positioned above the bottom navigation.
- English and Persian copy for all new functional UI, logical directional spacing, visible keyboard focus, skip links, safe-area spacing and reduced-motion handling.

No contract, payment, token approval, backend provisioning or transaction semantics were changed. No mainnet deployment was performed.

## Images

The two original illustrations were generated with the built-in image generation tool and optimized into local WebP assets. No third-party image hotlinks or stock-photo requests are required.

- `public/images/experience/network.webp`: blue glass and titanium loop with connected nodes. Hero and workspace artwork.
- `public/images/experience/collection.webp`: glass shield, digital cards and book. Product and learning artwork.

### Generation prompts

**Network:** Premium editorial 3D artwork for Dravon, a Web3 dashboard. Landscape 3:2. A monumental sculptural loop of brushed titanium and translucent electric cobalt blue glass, floating above a dark navy reflective plane. Within the loop, a small luminous sphere and delicate interconnected crystalline nodes suggest a decentralized network. Architectural product photography, realistic caustics, precise bevels, soft volumetric light, physically rendered materials, midnight navy background, cool silver highlights. Centered subject with generous negative space. No text, logos, UI, charts, coins or numbers. Intended for a 600 × 510 px image panel beside a headline.

**Collection:** One elegant editorial 3D cover for a premium Web3 digital products collection. Landscape 3:2. A balanced still life on a midnight navy studio surface: an upright translucent icy blue glass shield, floating blank brushed titanium and cobalt rounded cards, and a midnight blue bound book with a subtle silver asterisk. Separated objects, restrained composition, realistic textures and reflections, electric blue rim lighting. No lettering, currency symbols, logos, UI, grids or inset panels. Intended for a 600 × 350 px panel.

## Review checklist

- Home: both primary destinations, mobile navigation and expandable FAQ.
- Catalog: each category, a matching search, a zero-result search, reset, product links and details.
- Workspace: connected/disconnected wallet controls, account search and existing transaction flows.
- Accessibility/layout: keyboard dialog focus/escape, 360/390/768/1440 px widths, both locales, both themes and reduced motion.

The cloud browser in this session rejected local preview URLs with `ERR_BLOCKED_BY_CLIENT`; interactive and screenshot review is still required before release. Static checks are recorded in the pull request.
