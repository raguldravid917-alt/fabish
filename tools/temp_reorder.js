const fs = require('fs');
const file = 'c:/Users/ragul/OneDrive/Desktop/fabish/frontend/src/components/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

const profileStartStr = '            <div className="relative h-full flex items-center" ref={accountDropdownRef}>';
const profileStart = content.indexOf(profileStartStr);

const wishlistStartStr = '            <button\n              onClick={() => {\n                if (!user) {\n                  navigate(\'/account/profile?tab=wishlist\');';
const wishlistStart = content.indexOf(wishlistStartStr);

const cartEndStr = '            </button>\n          </div>\n        </div>\n      </header>';
const cartEnd = content.indexOf(cartEndStr);

if (profileStart > -1 && wishlistStart > -1 && cartEnd > -1) {
  const profileBlock = content.slice(profileStart, wishlistStart);

  const exactWishlistCartEnd = content.indexOf('            </button>', content.indexOf('aria-label="Cart"')) + 22; // include </button>\n
  const wishlistCartBlock = content.slice(wishlistStart, exactWishlistCartEnd);

  const before = content.slice(0, profileStart);
  const after = content.slice(exactWishlistCartEnd);

  fs.writeFileSync(file, before + wishlistCartBlock + profileBlock + after);
  console.log('Reordered successfully.');
} else {
  console.log('Could not find markers.', {profileStart, wishlistStart, cartEnd});
}
