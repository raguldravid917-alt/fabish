const {
  ProductSectionConfig,
  ProductHighlight,
  ProductBenefit,
  ProductIngredient,
  ProductSpecification,
  ProductUsageStep,
  ProductFAQ,
  ProductTextSection,
  ProductFrequentlyBoughtTogether,
  // New
  ProductCertification,
  ProductTrustBadge,
  ProductOffer,
  ProductWhyLove,
  ProductCareInstruction
} = require('../models/ProductContent');

/**
 * GET /api/products/:productId/content
 * Returns all content blocks for a product (public).
 */
exports.getProductContent = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [
      configs,
      highlights,
      benefits,
      ingredients,
      specifications,
      usageSteps,
      faqs,
      textSections,
      frequentlyBoughtTogether,
      // New
      certifications,
      trustBadges,
      offers,
      whyLoveIt,
      careInstructions
    ] = await Promise.all([
      ProductSectionConfig.find({ product: productId }).sort({ order: 1 }),
      ProductHighlight.find({ product: productId }).sort({ order: 1 }),
      ProductBenefit.find({ product: productId }).sort({ order: 1 }),
      ProductIngredient.find({ product: productId }).sort({ order: 1 }),
      ProductSpecification.find({ product: productId }).sort({ order: 1 }),
      ProductUsageStep.find({ product: productId }).sort({ order: 1 }),
      ProductFAQ.find({ product: productId }).sort({ order: 1 }),
      ProductTextSection.find({ product: productId }),
      ProductFrequentlyBoughtTogether.find({ product: productId }).populate('bundleProduct'),
      // New parallel fetches
      ProductCertification.find({ product: productId }).sort({ order: 1 }),
      ProductTrustBadge.find({ product: productId }).sort({ order: 1 }),
      ProductOffer.find({ product: productId }).sort({ order: 1 }),
      ProductWhyLove.find({ product: productId }).sort({ order: 1 }),
      ProductCareInstruction.find({ product: productId }).sort({ order: 1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        configs,
        highlights,
        benefits,
        ingredients,
        specifications,
        usageSteps,
        faqs,
        textSections,
        frequentlyBoughtTogether,
        // New
        certifications,
        trustBadges,
        offers,
        whyLoveIt,
        careInstructions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:productId/content
 * Replaces all content blocks for a product (admin only).
 * Uses a delete-then-insertMany pattern for atomic replacement.
 */
exports.updateProductContent = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const {
      configs,
      highlights,
      benefits,
      ingredients,
      specifications,
      usageSteps,
      faqs,
      textSections,
      frequentlyBoughtTogether,
      // New
      certifications,
      trustBadges,
      offers,
      whyLoveIt,
      careInstructions
    } = req.body;

    // ── 1. Section Layout Configs ─────────────────────────────────────────────
    if (configs) {
      await ProductSectionConfig.deleteMany({ product: productId });
      if (configs.length > 0) {
        const docs = configs.map((c, index) => ({
          product:     productId,
          sectionType: c.sectionType,
          isEnabled:   c.isEnabled !== undefined ? c.isEnabled : true,
          order:       c.order !== undefined ? c.order : index
        }));
        await ProductSectionConfig.insertMany(docs);
      }
    }

    // ── 2. Highlights ─────────────────────────────────────────────────────────
    if (highlights) {
      await ProductHighlight.deleteMany({ product: productId });
      if (highlights.length > 0) {
        const docs = highlights.map((h, index) => ({ product: productId, text: h.text, order: index }));
        await ProductHighlight.insertMany(docs);
      }
    }

    // ── 3. Benefits ───────────────────────────────────────────────────────────
    if (benefits) {
      await ProductBenefit.deleteMany({ product: productId });
      if (benefits.length > 0) {
        const docs = benefits.map((b, index) => ({
          product: productId, icon: b.icon || '', title: b.title, description: b.description || '', order: index
        }));
        await ProductBenefit.insertMany(docs);
      }
    }

    // ── 4. Ingredients ────────────────────────────────────────────────────────
    if (ingredients) {
      await ProductIngredient.deleteMany({ product: productId });
      if (ingredients.length > 0) {
        const docs = ingredients.map((i, index) => ({
          product: productId, name: i.name, description: i.description || '', order: index
        }));
        await ProductIngredient.insertMany(docs);
      }
    }

    // ── 5. Specifications ─────────────────────────────────────────────────────
    if (specifications) {
      await ProductSpecification.deleteMany({ product: productId });
      if (specifications.length > 0) {
        const docs = specifications.map((s, index) => ({
          product: productId, key: s.key, value: s.value, order: index
        }));
        await ProductSpecification.insertMany(docs);
      }
    }

    // ── 6. Usage Steps ────────────────────────────────────────────────────────
    if (usageSteps) {
      await ProductUsageStep.deleteMany({ product: productId });
      if (usageSteps.length > 0) {
        const docs = usageSteps.map((u, index) => ({
          product: productId, title: u.title || '', instruction: u.instruction, order: index
        }));
        await ProductUsageStep.insertMany(docs);
      }
    }

    // ── 7. FAQs ───────────────────────────────────────────────────────────────
    if (faqs) {
      await ProductFAQ.deleteMany({ product: productId });
      if (faqs.length > 0) {
        const docs = faqs.map((f, index) => ({
          product: productId, question: f.question, answer: f.answer, order: index
        }));
        await ProductFAQ.insertMany(docs);
      }
    }

    // ── 8. Text Sections ──────────────────────────────────────────────────────
    if (textSections) {
      await ProductTextSection.deleteMany({ product: productId });
      if (textSections.length > 0) {
        const docs = textSections
          .filter(t => t.sectionType && t.content && t.content.trim())
          .map(t => ({ product: productId, sectionType: t.sectionType, content: t.content || '' }));
        if (docs.length > 0) await ProductTextSection.insertMany(docs);
      }
    }

    // ── 9. Frequently Bought Together ─────────────────────────────────────────
    if (frequentlyBoughtTogether) {
      await ProductFrequentlyBoughtTogether.deleteMany({ product: productId });
      if (frequentlyBoughtTogether.length > 0) {
        const docs = frequentlyBoughtTogether.map(bundleId => ({ product: productId, bundleProduct: bundleId }));
        await ProductFrequentlyBoughtTogether.insertMany(docs);
      }
    }

    // ── 10. NEW: Certifications ───────────────────────────────────────────────
    if (certifications) {
      await ProductCertification.deleteMany({ product: productId });
      if (certifications.length > 0) {
        const docs = certifications.map((c, index) => ({
          product: productId, name: c.name, icon: c.icon || 'Award', description: c.description || '', order: index
        }));
        await ProductCertification.insertMany(docs);
      }
    }

    // ── 11. NEW: Trust Badges ─────────────────────────────────────────────────
    if (trustBadges) {
      await ProductTrustBadge.deleteMany({ product: productId });
      if (trustBadges.length > 0) {
        const docs = trustBadges.map((b, index) => ({
          product: productId, title: b.title, icon: b.icon || 'Shield', order: index
        }));
        await ProductTrustBadge.insertMany(docs);
      }
    }

    // ── 12. NEW: Offers ───────────────────────────────────────────────────────
    if (offers) {
      await ProductOffer.deleteMany({ product: productId });
      if (offers.length > 0) {
        const docs = offers.map((o, index) => ({
          product:       productId,
          type:          o.type,
          title:         o.title,
          description:   o.description || '',
          code:          o.code || '',
          discountValue: o.discountValue || '',
          validUntil:    o.validUntil || null,
          isActive:      o.isActive !== undefined ? o.isActive : true,
          order:         index
        }));
        await ProductOffer.insertMany(docs);
      }
    }

    // ── 13. NEW: Why You'll Love It ───────────────────────────────────────────
    if (whyLoveIt) {
      await ProductWhyLove.deleteMany({ product: productId });
      if (whyLoveIt.length > 0) {
        const docs = whyLoveIt.map((w, index) => ({
          product: productId, icon: w.icon || 'Heart', title: w.title, description: w.description || '', order: index
        }));
        await ProductWhyLove.insertMany(docs);
      }
    }

    // ── 14. NEW: Care Instructions ────────────────────────────────────────────
    if (careInstructions) {
      await ProductCareInstruction.deleteMany({ product: productId });
      if (careInstructions.length > 0) {
        const docs = careInstructions.map((c, index) => ({
          product: productId, instruction: c.instruction, order: index
        }));
        await ProductCareInstruction.insertMany(docs);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product content updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
