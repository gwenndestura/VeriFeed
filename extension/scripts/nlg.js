// ============================================================================
// VeriFeed NLG - Bilingual (English & Filipino) Simplified for Citizens
// ============================================================================

class EnhancedDeepfakeNLG {
  constructor() {
    this.currentLanguage = 'en'; // Default to English
    
    // What the AI looks at (in order of importance)
    this.featureWeights = {
      temporal_consistency: 0.35,
      facial_artifacts: 0.25,
      texture_anomalies: 0.20,
      lighting_consistency: 0.12,
      motion_patterns: 0.08
    };

    // Bilingual knowledge base
    this.knowledgeBase = {
      en: {
        temporal_consistency: {
          description: "Checks if the video flows smoothly from one frame to the next",
          high: "The video plays smoothly with no weird jumps or glitches",
          low: "Parts of the video suddenly change or morph unnaturally between frames",
          technical: "Analyzes how consistently features appear across frames"
        },
        facial_artifacts: {
          description: "Looks for signs that a face was created or altered by AI",
          high: "The face looks natural with real skin texture, pores, and realistic details",
          low: "The face looks too smooth, blurry around the edges, or has unnatural features",
          technical: "Detects artificial patterns typical of AI-generated faces"
        },
        texture_anomalies: {
          description: "Checks if textures (skin, hair, clothing) look consistent and real",
          high: "All textures look natural and consistent throughout the video",
          low: "Some areas look unnaturally smooth while others are too detailed",
          technical: "Analyzes texture patterns for AI manipulation signs"
        },
        lighting_consistency: {
          description: "Checks if lighting and shadows behave realistically",
          high: "Shadows and lighting move naturally as the person moves",
          low: "Shadows don't match the light source or stay frozen when the person moves",
          technical: "Validates that lighting follows real-world physics"
        },
        motion_patterns: {
          description: "Looks at how naturally the person moves and shows expressions",
          high: "Natural blinking, realistic facial expressions, and smooth head movements",
          low: "Missing or weird blinking, robotic expressions, or stiff movements",
          technical: "Tracks facial movements and expression naturalness"
        }
      },
      fil: {
        temporal_consistency: {
          description: "Sinusuri kung ang video ay umaagos nang maayos mula sa isang frame patungo sa susunod",
          high: "Ang video ay umaagos nang maayos nang walang biglaang pagtalon o pagkasira",
          low: "Ang ilang bahagi ng video ay bigla na lamang nagbabago o nag-morph nang hindi natural",
          technical: "Sinusuri kung gaano ka-consistent ang mga features sa buong video"
        },
        facial_artifacts: {
          description: "Hinahanap ang mga senyales na ang mukha ay nilikha o binago ng AI",
          high: "Ang mukha ay mukhang natural na may tunay na texture ng balat, pores, at makatotohanang detalye",
          low: "Ang mukha ay sobrang kinis, malabo sa gilid, o may hindi natural na features",
          technical: "Tumutukoy ng artificial patterns na karaniwan sa AI-generated faces"
        },
        texture_anomalies: {
          description: "Sinusuri kung ang textures (balat, buhok, damit) ay mukhang consistent at totoo",
          high: "Lahat ng textures ay mukhang natural at consistent sa buong video",
          low: "Ang ilang bahagi ay sobrang kinis habang ang iba ay sobrang detalyado",
          technical: "Sinusuri ang texture patterns para sa mga tanda ng AI manipulation"
        },
        lighting_consistency: {
          description: "Sinusuri kung ang ilaw at anino ay kumikilos nang realistic",
          high: "Ang anino at ilaw ay kumikilos nang natural habang gumagalaw ang tao",
          low: "Ang anino ay hindi tumutugma sa pinagmulan ng ilaw o nanatiling nakatigil habang gumagalaw ang tao",
          technical: "Binibigyang-katibayan na ang ilaw ay sumusunod sa tunay na pisika"
        },
        motion_patterns: {
          description: "Tinitingnan kung gaano ka-natural ang paggalaw at pagpapakita ng emosyon ng tao",
          high: "Natural na pagkurap, realistic na facial expressions, at maayos na paggalaw ng ulo",
          low: "Nawawalang o kakaibang pagkurap, robotic expressions, o matigas na paggalaw",
          technical: "Sinusubaybayan ang facial movements at naturalness ng expression"
        }
      }
    };
  }

  /**
   * Set the current language
   */
  setLanguage(lang) {
    if (lang === 'en' || lang === 'fil') {
      this.currentLanguage = lang;
      console.log(`[VeriFeed NLG] Language set to: ${lang}`);
    }
  }

  /**
   * Get the current language
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Generate interpretation based on prediction and confidence
   */
  generateInterpretation(prediction, confidence) {
    const isReal = prediction === 'REAL';
    const lang = this.currentLanguage;

    let riskLevel, summaryText, detailsText;

    if (lang === 'en') {
      if (isReal) {
        if (confidence >= 85) {
          riskLevel = "Low Risk - Likely Authentic";
          summaryText = "This video shows strong signs of being authentic. The model found consistent patterns of real, unedited video content across all frames.";
          detailsText = "Strong signs of authenticity detected. However, no automated system is 100% accurate. Always verify the source and consider the context.";
        } else if (confidence >= 70) {
          riskLevel = "Moderate Caution - Likely Authentic";
          summaryText = "This video appears to be authentic, though with some minor concerns. The model found mostly genuine characteristics with small inconsistencies.";
          detailsText = "Mostly authentic but some inconsistencies require careful review for important decisions. Cross-reference with multiple sources.";
        } else {
          riskLevel = "High Caution - Uncertain";
          summaryText = "The video shows more authentic characteristics than manipulated ones, but some inconsistencies were found, making it difficult to classify with certainty.";
          detailsText = "Mixed signals make classification difficult. May be authentic with quality issues or sophisticated manipulation. Verify through trusted sources before sharing.";
        }
      } else {
        if (confidence >= 85) {
          riskLevel = "High Risk - Likely Manipulated";
          summaryText = "This video shows multiple clear signs of AI manipulation. The model found major differences from natural videos with patterns that match known deepfake patterns.";
          detailsText = "Multiple strong manipulation signs detected. High likelihood of deepfake or AI-generated content. Verify through fact-checking organizations.";
        } else if (confidence >= 70) {
          riskLevel = "Elevated Risk - Possibly Manipulated";
          summaryText = "The video shows several characteristics that match deepfake manipulation. Notable patterns suggest possible AI generation, though not all signs are conclusive.";
          detailsText = "Notable manipulation signs present. Treat with high skepticism. Verify through reliable sources before sharing.";
        } else {
          riskLevel = "Uncertain - Investigation Needed";
          summaryText = "Some manipulation signs are present with conflicting signals. May show subtle manipulation or detection limitations.";
          detailsText = "Some manipulation signs with conflicting signals. May be partial editing or edge case. Treat with skepticism and research the context thoroughly.";
        }
      }
    } else { // Filipino
      if (isReal) {
        if (confidence >= 85) {
          riskLevel = "Mababang Panganib - Malamang na Totoo";
          summaryText = "Ang video na ito ay nagpapakita ng maraming tanda ng pagiging totoo. Ang model ay nakahanap ng tuloy-tuloy na pattern ng tunay at hindi binagong video sa lahat ng frames.";
          detailsText = "Malakas na mga tanda ng pagiging totoo ang nadetekta. Gayunpaman, walang automated system na 100% tumpak. Palaging i-verify ang pinagmulan at isaalang-alang ang konteksto.";
        } else if (confidence >= 70) {
          riskLevel = "Katamtamang Pag-iingat - Malamang na Totoo";
          summaryText = "Ang video na ito ay mukhang totoo, ngunit may ilang munting alalahanin. Ang model ay nakahanap ng pangunahing tunay na katangian na may maliliit na hindi pagkakaayon.";
          detailsText = "Pangunahing totoo ngunit ang ilang hindi pagkakaayon ay kailangan ng maingat na pagsusuri para sa mahahalagang desisyon. Mag-cross-reference sa maraming mapagkukunan.";
        } else {
          riskLevel = "Mataas na Pag-iingat - Hindi Sigurado";
          summaryText = "Ang video ay nagpapakita ng mas maraming tanda ng pagiging totoo kaysa sa mga manipulated, ngunit may ilang hindi pagkakaayon na natagpuan, na ginagawang mahirap ang tiyak na pagklasipika.";
          detailsText = "Ang magkahalong mga senyales ay ginagawang mahirap ang pagklasipika. Maaaring totoo na may isyu sa kalidad o sopistikadong manipulation. I-verify sa pinagkakatiwalaang mga mapagkukunan bago ibahagi.";
        }
      } else {
        if (confidence >= 85) {
          riskLevel = "Mataas na Panganib - Malamang na Manipulated";
          summaryText = "Ang video na ito ay nagpapakita ng maraming malinaw na tanda ng AI manipulation. Ang model ay nakahanap ng malalaking pagkakaiba mula sa natural na video na may mga pattern na tumutugma sa kilalang deepfake patterns.";
          detailsText = "Maraming malakas na tanda ng manipulation ang nadetekta. Mataas ang posibilidad na deepfake o AI-generated content. I-verify sa mga fact-checking organizations.";
        } else if (confidence >= 70) {
          riskLevel = "Tumaas na Panganib - Posibleng Manipulated";
          summaryText = "Ang video ay nagpapakita ng ilang mga katangiang tumutugma sa deepfake manipulation. Ang mga pattern ay nagmumungkahi ng posibleng AI generation, kahit na hindi lahat ng mga tanda ay tiyak.";
          detailsText = "May mga tanda ng manipulation. Tratuhin nang may mataas na skepticism. I-verify sa mga mapagkakatiwalaang mapagkukunan bago ibahagi.";
        } else {
          riskLevel = "Hindi Sigurado - Kailangan ng Pagsisiyasat";
          summaryText = "May ilang tanda ng manipulation na may magkasalungat na senyales. Maaaring may subtle manipulation o mga limitasyon ng detection.";
          detailsText = "May ilang tanda ng manipulation na may magkasalungat na senyales. Maaaring partial editing o edge case. Tratuhin nang may skepticism at masinsinang pag-aralan ang konteksto.";
        }
      }
    }

    return {
      riskLevel,
      summaryText,
      detailsText,
      isAuthentic: isReal
    };
  }

  /**
   * Generate explanation with language support
   */
  generateExplanation(prediction, confidence, features = null) {
    const isReal = prediction === 'REAL';
    
    return {
      summary: this.generateSummary(isReal, confidence, features),
      mainReason: this.generateMainReason(isReal, confidence, features),
      technicalDetails: this.generateTechnicalDetails(features),
      visualIndicators: this.generateVisualIndicators(features),
      confidenceExplanation: this.explainConfidence(confidence, features),
      recommendation: this.generateRecommendation(isReal, confidence),
      features: features
    };
  }

  /**
   * Simple summary anyone can understand
   */
  generateSummary(isReal, confidence, features) {
    const lang = this.currentLanguage;
    
    if (!features) {
      if (lang === 'en') {
        if (isReal) {
          if (confidence >= 85) {
            return `VeriFeed is ${confidence}% confident this video is REAL. The video shows strong signs of being authentic and unedited.`;
          } else if (confidence >= 70) {
            return `VeriFeed believes this video is probably REAL (${confidence}% confident), but there are some minor concerns.`;
          } else {
            return `This video leans toward being REAL, but VeriFeed is less certain (${confidence}% confidence).`;
          }
        } else {
          if (confidence >= 85) {
            return `VeriFeed is ${confidence}% confident this is a DEEPFAKE. Multiple red flags suggest this video was artificially created or heavily edited.`;
          } else if (confidence >= 70) {
            return `This video shows several signs of being a DEEPFAKE (${confidence}% confident), though not all signs are definitive.`;
          } else {
            return `Some signs suggest this might be fake, but the signals are mixed (${confidence}% confidence).`;
          }
        }
      } else { // Filipino
        if (isReal) {
          if (confidence >= 85) {
            return `Ang VeriFeed ay ${confidence}% sigurado na ang video na ito ay TOTOO. Ang video ay nagpapakita ng malakas na mga tanda ng pagiging authentic at hindi na-edit.`;
          } else if (confidence >= 70) {
            return `Naniniwala ang VeriFeed na ang video na ito ay malamang na TOTOO (${confidence}% sigurado), ngunit may ilang munting alalahanin.`;
          } else {
            return `Ang video na ito ay kumikiling sa pagiging TOTOO, ngunit ang VeriFeed ay hindi gaanong sigurado (${confidence}% kumpiyansa).`;
          }
        } else {
          if (confidence >= 85) {
            return `Ang VeriFeed ay ${confidence}% sigurado na ito ay isang DEEPFAKE. Maraming red flags ang nagmumungkahi na ang video na ito ay artificially created o lubhang na-edit.`;
          } else if (confidence >= 70) {
            return `Ang video na ito ay nagpapakita ng ilang mga tanda ng pagiging DEEPFAKE (${confidence}% sigurado), kahit na hindi lahat ng tanda ay tiyak.`;
          } else {
            return `May ilang mga tanda na nagmumungkahi na ito ay maaaring fake, ngunit ang mga senyales ay magkahalong (${confidence}% kumpiyansa).`;
          }
        }
      }
    }

    const topFeatures = this.getTopFeatures(features, 2);
    const featureNames = topFeatures.map(f => this.getFeatureFriendlyName(f.name)).join(lang === 'en' ? ' and ' : ' at ');
    
    if (lang === 'en') {
      if (isReal) {
        if (confidence >= 85) {
          return `This video looks AUTHENTIC. VeriFeed checked the ${featureNames} and found they match real, unedited videos. Confidence: ${confidence}%.`;
        } else if (confidence >= 70) {
          return `This video is probably REAL (${confidence}% confident). The ${featureNames} mostly look genuine, but there are some small inconsistencies.`;
        } else {
          return `The video leans toward being real, but VeriFeed found some confusing signals in the ${featureNames}. Confidence: ${confidence}%.`;
        }
      } else {
        if (confidence >= 85) {
          return `This video is likely a DEEPFAKE. The ${featureNames} show clear signs of AI manipulation. Confidence: ${confidence}%.`;
        } else if (confidence >= 70) {
          return `This video shows several DEEPFAKE warning signs (${confidence}% confident). The ${featureNames} have concerning patterns.`;
        } else {
          return `Some manipulation detected in the ${featureNames}, but the signals are mixed. Confidence: ${confidence}%.`;
        }
      }
    } else { // Filipino
      if (isReal) {
        if (confidence >= 85) {
          return `Ang video na ito ay mukhang AUTHENTIC. Sinuri ng VeriFeed ang ${featureNames} at natagpuan na tumutugma sa mga tunay at hindi na-edit na videos. Kumpiyansa: ${confidence}%.`;
        } else if (confidence >= 70) {
          return `Ang video na ito ay malamang na TOTOO (${confidence}% sigurado). Ang ${featureNames} ay mukhang tunay, ngunit may ilang maliliit na hindi pagkakaayon.`;
        } else {
          return `Ang video ay kumikiling sa pagiging totoo, ngunit ang VeriFeed ay nakahanap ng ilang nakalilitong senyales sa ${featureNames}. Kumpiyansa: ${confidence}%.`;
        }
      } else {
        if (confidence >= 85) {
          return `Ang video na ito ay malamang na isang DEEPFAKE. Ang ${featureNames} ay nagpapakita ng malinaw na mga tanda ng AI manipulation. Kumpiyansa: ${confidence}%.`;
        } else if (confidence >= 70) {
          return `Ang video na ito ay nagpapakita ng ilang DEEPFAKE warning signs (${confidence}% sigurado). Ang ${featureNames} ay may mga nakababahalang pattern.`;
        } else {
          return `May ilang manipulation na nadetekta sa ${featureNames}, ngunit ang mga senyales ay magkahalong. Kumpiyansa: ${confidence}%.`;
        }
      }
    }
  }

  // Additional helper methods remain the same but can be extended for Filipino
  generateMainReason(isReal, confidence, features) {
    // Simplified - can be extended for Filipino later if needed
    return this.generateSummary(isReal, confidence, features);
  }

  generateTechnicalDetails(features) {
    if (!features) return [];
    return [];
  }

  generateVisualIndicators(features) {
    if (!features) return [];
    return [];
  }

  explainConfidence(confidence, features) {
    const lang = this.currentLanguage;
    
    if (lang === 'en') {
      let explanation = `**${confidence.toFixed(0)}% Confidence** means:\n\n`;
      
      if (confidence >= 90) {
        explanation += `VeriFeed is very sure about its prediction. In testing, predictions this confident are usually correct.`;
      } else if (confidence >= 75) {
        explanation += `VeriFeed is fairly confident, but not 100% certain. Most predictions at this level are accurate.`;
      } else if (confidence >= 60) {
        explanation += `VeriFeed has moderate confidence. There's more uncertainty, so users should verify through other sources.`;
      } else {
        explanation += `VeriFeed is less certain. The signals are mixed, so users should take this prediction with caution and seek additional verification.`;
      }
      
      return explanation;
    } else { // Filipino
      let explanation = `**${confidence.toFixed(0)}% Kumpiyansa** ay nangangahulugang:\n\n`;
      
      if (confidence >= 90) {
        explanation += `Ang VeriFeed ay sigurado sa prediction nito. Sa pagsusulit, ang mga prediction na ganito ka-confident ay karaniwang tama.`;
      } else if (confidence >= 75) {
        explanation += `Ang VeriFeed ay medyo sigurado, ngunit hindi 100% tiyak. Karamihan ng mga predictions sa level na ito ay tumpak.`;
      } else if (confidence >= 60) {
        explanation += `Ang VeriFeed ay may katamtamang kumpiyansa. May mas maraming kawalan ng katiyakan, kaya dapat i-verify ng mga users sa ibang mapagkukunan.`;
      } else {
        explanation += `Ang VeriFeed ay hindi gaanong sigurado. Ang mga senyales ay magkahalong, kaya dapat tanggapin ng mga users ang prediction na ito nang may pag-iingat at humanap ng karagdagang verification.`;
      }
      
      return explanation;
    }
  }

  generateRecommendation(isReal, confidence) {
    const lang = this.currentLanguage;
    
    if (lang === 'en') {
      if (isReal) {
        if (confidence >= 85) {
          return {
            action: 'Likely Real',
            riskLevel: 'low',
            details: 'VeriFeed found strong signs this video is authentic. However, no system is perfect.',
            tips: [
              'Check if the video comes from a trustworthy source',
              'See if the content matches known facts',
              'Look for the same video from other reliable sources',
              'For important decisions, consider getting expert verification'
            ]
          };
        } else if (confidence >= 70) {
          return {
            action: 'Probably Real, But Be Careful',
            riskLevel: 'moderate',
            details: 'Mostly looks authentic, but there are some small concerns. Users should be cautious if this video is important.',
            tips: [
              'Check multiple reliable sources before trusting',
              'Look at when and where the video was posted',
              'Try reverse image search on screenshots from the video',
              'Avoid making important decisions based solely on this video'
            ]
          };
        } else {
          return {
            action: 'Uncertain - Proceed with Caution',
            riskLevel: 'high',
            details: 'VeriFeed can\'t confidently tell if this is real or fake. It might be real but poor quality, or a sophisticated fake.',
            tips: [
              'Verify from trusted sources before sharing',
              'Try to find the original source of the video',
              'Consider asking an expert to verify if it\'s important',
              'Report it if it appears to be spreading false information'
            ]
          };
        }
      } else {
        if (confidence >= 85) {
          return {
            action: 'High Risk - Likely Fake',
            riskLevel: 'critical',
            details: 'Strong evidence this is a deepfake or heavily manipulated video. Multiple warning signs were detected.',
            tips: [
              'Verify through official fact-checking organizations',
              'Be cautious about sharing this content',
              'Check trusted news sources for verification',
              'Report if spreading misinformation'
            ]
          };
        } else if (confidence >= 70) {
          return {
            action: 'Elevated Risk - Possibly Fake',
            riskLevel: 'high',
            details: 'Several warning signs suggest this might be a deepfake. Users should treat it with high suspicion.',
            tips: [
              'Verify through official fact-checking organizations',
              'Check trusted news sources for verification',
              'Be skeptical until verified',
              'Monitor for updates from reliable sources'
            ]
          };
        } else {
          return {
            action: 'Uncertain - Needs Investigation',
            riskLevel: 'moderate',
            details: 'Some suspicious signs were found, but not conclusive. Could be partial editing or an unusual case.',
            tips: [
              'Treat with skepticism until verified',
              'Research the context and source carefully',
              'Consult fact-checkers if the video is important',
              'Watch for official verification from trusted sources'
            ]
          };
        }
      }
    } else { // Filipino
      if (isReal) {
        if (confidence >= 85) {
          return {
            action: 'Malamang na Totoo',
            riskLevel: 'low',
            details: 'Ang VeriFeed ay nakahanap ng malakas na mga tanda na ang video na ito ay authentic. Gayunpaman, walang system na perpekto.',
            tips: [
              'Suriin kung ang video ay nanggaling sa pinagkakatiwalaang mapagkukunan',
              'Tingnan kung ang content ay tumutugma sa kilalang mga katotohanan',
              'Hanapin ang parehong video mula sa iba pang maaasahang mapagkukunan',
              'Para sa mahahalagang desisyon, isaalang-alang ang pagkuha ng expert verification'
            ]
          };
        } else if (confidence >= 70) {
          return {
            action: 'Malamang na Totoo, Ngunit Mag-ingat',
            riskLevel: 'moderate',
            details: 'Karamihan ay mukhang authentic, ngunit may ilang maliliit na alalahanin. Ang mga users ay dapat mag-ingat kung ang video na ito ay mahalaga.',
            tips: [
              'Suriin ang maraming maaasahang mapagkukunan bago magtiwala',
              'Tingnan kung kailan at saan nag-post ang video',
              'Subukan ang reverse image search sa mga screenshot mula sa video',
              'Iwasang gumawa ng mahahalagang desisyon base lamang sa video na ito'
            ]
          };
        } else {
          return {
            action: 'Hindi Sigurado - Magpatuloy nang May Pag-iingat',
            riskLevel: 'high',
            details: 'Hindi siguradong masasabi ng VeriFeed kung ito ay totoo o fake. Maaaring totoo ngunit may masamang kalidad, o isang sopistikadong fake.',
            tips: [
              'I-verify mula sa pinagkakatiwalaang mapagkukunan bago ibahagi',
              'Subukang hanapin ang orihinal na mapagkukunan ng video',
              'Isaalang-alang ang pagtatanong sa isang eksperto upang i-verify kung mahalaga',
              'I-report ito kung lumilitaw na nagkakalat ng maling impormasyon'
            ]
          };
        }
      } else {
        if (confidence >= 85) {
          return {
            action: 'Mataas na Panganib - Malamang na Fake',
            riskLevel: 'critical',
            details: 'Malakas na ebidensya na ito ay isang deepfake o lubhang manipulated video. Maraming warning signs ang nadetekta.',
            tips: [
              'I-verify sa opisyal na fact-checking organizations',
              'Mag-ingat sa pagbabahagi ng content na ito',
              'Suriin ang pinagkakatiwalaang news sources para sa verification',
              'I-report kung nagkakalat ng maling impormasyon'
            ]
          };
        } else if (confidence >= 70) {
          return {
            action: 'Tumaas na Panganib - Posibleng Fake',
            riskLevel: 'high',
            details: 'Ilang warning signs ang nagmumungkahi na ito ay maaaring isang deepfake. Dapat tratuhin ng mga users na may mataas na suspetsa.',
            tips: [
              'I-verify sa opisyal na fact-checking organizations',
              'Suriin ang pinagkakatiwalaang news sources para sa verification',
              'Maging skeptical hanggang ma-verify',
              'Sumubaybay para sa mga update mula sa maaasahang mapagkukunan'
            ]
          };
        } else {
          return {
            action: 'Hindi Sigurado - Kailangan ng Pagsisiyasat',
            riskLevel: 'moderate',
            details: 'May ilang kahina-hinalang mga tanda na natagpuan, ngunit hindi conclusive. Maaaring partial editing o isang hindi pangkaraniwang kaso.',
            tips: [
              'Tratuhin nang may skepticism hanggang ma-verify',
              'Masinsinang pag-aralan ang konteksto at mapagkukunan',
              'Kumunsulta sa mga fact-checkers kung ang video ay mahalaga',
              'Bantayan ang opisyal na verification mula sa pinagkakatiwalaang mapagkukunan'
            ]
          };
        }
      }
    }
  }

  // Helper methods
  calculateFeatureAgreement(features) {
    const scores = Object.values(features);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, 1 - (stdDev / 50));
  }

  getTopFeatures(features, count) {
    if (!features) return [];
    return Object.entries(features)
      .map(([name, score]) => ({ name, score, weight: this.featureWeights[name] }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, count);
  }

  getFeatureFriendlyName(technicalName) {
    const lang = this.currentLanguage;
    
    if (lang === 'en') {
      const names = {
        temporal_consistency: 'video smoothness',
        facial_artifacts: 'face naturalness',
        texture_anomalies: 'texture quality',
        lighting_consistency: 'lighting & shadows',
        motion_patterns: 'movement & expressions'
      };
      return names[technicalName] || technicalName;
    } else { // Filipino
      const names = {
        temporal_consistency: 'kaayusan ng video',
        facial_artifacts: 'natural na mukha',
        texture_anomalies: 'kalidad ng texture',
        lighting_consistency: 'ilaw at anino',
        motion_patterns: 'paggalaw at ekspresyon'
      };
      return names[technicalName] || technicalName;
    }
  }
}

// Export for use in popup.js
const deepfakeNLG = new EnhancedDeepfakeNLG();

console.log('[VeriFeed NLG] Bilingual system loaded (English & Filipino) - Citizen-friendly explanations ready');
