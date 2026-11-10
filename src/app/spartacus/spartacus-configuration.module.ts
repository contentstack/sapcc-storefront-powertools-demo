import { isDevMode, NgModule } from '@angular/core';
import { translationChunksConfig, translationsEn } from '@spartacus/assets';
import {
  FeaturesConfig,
  I18nConfig,
  OccConfig,
  provideConfig,
  provideConfigFactory,
  SiteContextConfig,
} from '@spartacus/core';
import {
  defaultCmsContentProviders,
  layoutConfigFactory,
  mediaConfig,
} from '@spartacus/storefront';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    provideConfigFactory(layoutConfigFactory),
    provideConfig(mediaConfig),
    ...defaultCmsContentProviders,
    provideConfig(<OccConfig>{
      backend: {
        occ: {
          // Dev: same-origin, so `ng serve` proxies /occ and /medias to the
          // backend (proxy.conf.json) and its self-signed cert never reaches
          // the browser or the Visual Builder iframe.
          baseUrl: isDevMode()
            ? window.location.origin
            : 'https://40.76.109.9:9002',
        },
      },
    }),
    provideConfig(<SiteContextConfig>{
      context: {
        baseSite: ['powertools-spa'],
      },
    }),
    provideConfig(<I18nConfig>{
      i18n: {
        resources: { en: translationsEn },
        chunks: translationChunksConfig,
        fallbackLang: 'en',
      },
    }),
    provideConfig(<FeaturesConfig>{
      features: {
        level: '221121.15',
      },
    }),
  ],
})
export class SpartacusConfigurationModule {}
