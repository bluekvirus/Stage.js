/**
 * This is the theme assets preparation tool to:
 *
 * 1. Gather font files from bower_components into [theme]/fonts
 * 2. Process logo & icons - resize and merge them into [theme]/img/sprite.png & [theme]/less/img.less
 * 3. Process texture - collect them into [theme]/less/img.less too
 *
 * Theme structures, one based on the other, in sequence:
 * 
 * Theme Assets
 * ------------
 * * Texture
 * * Fonts
 * * Icons
 * * Logo
 *
 * Theme Base (Vars)
 * ----------
 * * Colors
 * * Sizes (border, border-radius, font, shadow)
 * * Gaps (padding/margin)
 *
 * Theme Elements (Reuse vars as much as possible)
 * --------------
 * * Containers
 * * Components
 *
 * Make sure you follow the sequence when changing theme designs.
 *
 * @author Tim.Liu
 * @created 2014.07.21
 * 
 */