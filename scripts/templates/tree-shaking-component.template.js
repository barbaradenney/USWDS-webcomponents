var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var _this = this;
import { LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { DebugLogger } from '../../utils/debug-config.js';
// Import global USWDS styles (tree-shaking CSS complex due to SASS dependencies)
import '../../styles/styles.css';
/**
 * {{COMPONENT_NAME}} Web Component - Tree-Shaking Optimized
 *
 * This component uses selective USWDS imports for optimal JavaScript bundle size:
 * - JavaScript: Tree-shaking via @uswds/uswds/js/usa-{{COMPONENT_KEBAB}}
 * - CSS: Global styles (SASS import complexity requires this approach)
 * - Hybrid approach: Web component API with authentic USWDS functionality
 * - Graceful fallback: Falls back to full USWDS library if needed
 *
 * @element usa-{{COMPONENT_KEBAB}}
 * @fires {{COMPONENT_KEBAB}}-change - Dispatched when the component state changes
 */
var default_1 = function () {
    var _classDecorators = [customElement('usa-{{COMPONENT_KEBAB}}')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var default_1 = _classThis = /** @class */ (function () {
        function default_1() {
        }
        return default_1;
    }());
    __setFunctionName(_classThis, "default_1");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        default_1 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return default_1 = _classThis;
}();
export { default_1 };
{
    COMPONENT_CLASS;
}
LitElement;
{
    debug = new DebugLogger('{{COMPONENT_ICON}} {{COMPONENT_NAME}}');
    override;
    styles = css(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    :host {\n      display: block;\n    }\n\n    :host([hidden]) {\n      display: none;\n    }\n  "], ["\n    :host {\n      display: block;\n    }\n\n    :host([hidden]) {\n      display: none;\n    }\n  "])));
    value = '';
    disabled = false;
    uswdsModule: any = null;
    override;
    createRenderRoot();
    HTMLElement;
    {
        return this;
    }
    override;
    connectedCallback();
    {
        _super.connectedCallback.call(this);
        console.log("\uD83D\uDE80 {{COMPONENT_NAME}} ".concat(this.id || 'component', " initializing with tree-shaking optimization"));
        // Ensure component is visible (Light DOM doesn't apply static styles)
        this.style.display = 'block';
        // Initialize USWDS after component renders
        this.updateComplete.then(function () {
            _this.initializeUSWDS();
        });
    }
    override;
    disconnectedCallback();
    {
        _super.disconnectedCallback.call(this);
        this.cleanupUSWDS();
    }
    async;
    initializeUSWDS();
    {
        console.log("\uD83C\uDFAF {{COMPONENT_NAME}}: Initializing with tree-shaking optimization");
        try {
            // Tree-shaking: Import only the specific USWDS component module
            var module_1 = await import('@uswds/uswds/js/usa-{{COMPONENT_KEBAB}}');
            this.uswdsModule = module_1.default;
            // Initialize the USWDS component
            var componentElement = this.querySelector('.usa-{{COMPONENT_KEBAB}}');
            if (componentElement && this.uswdsModule) {
                // Try standard initialization methods
                if (typeof this.uswdsModule.on === 'function') {
                    this.uswdsModule.on(componentElement);
                    console.log("\u2705 Tree-shaken USWDS {{COMPONENT_KEBAB}} initialized successfully");
                }
                else if (typeof this.uswdsModule.init === 'function') {
                    this.uswdsModule.init(componentElement);
                    console.log("\u2705 Tree-shaken USWDS {{COMPONENT_KEBAB}} initialized with init method");
                }
                else {
                    console.warn("\u26A0\uFE0F {{COMPONENT_NAME}}: Module doesn't have expected initialization methods");
                    console.log("\uD83D\uDD0D Available methods:", Object.keys(this.uswdsModule || {}));
                    await this.setupBasicComponent();
                }
                // Set up event forwarding from USWDS to web component
                this.setupEventForwarding();
            }
        }
        catch (error) {
            console.warn("\u26A0\uFE0F Tree-shaking failed for {{COMPONENT_NAME}}, falling back to full USWDS:", error);
            await this.loadFullUSWDSLibrary();
        }
    }
    async;
    loadFullUSWDSLibrary();
    Promise < void  > {
        return: new Promise(function (resolve, reject) {
            // Check if USWDS is already loaded globally
            if (typeof window.USWDS !== 'undefined') {
                console.log("\uD83D\uDCE6 USWDS already available globally");
                _this.initializeWithGlobalUSWDS();
                resolve();
                return;
            }
            console.log("\uD83D\uDCE6 Loading full USWDS library as fallback...");
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@uswds/uswds@3.8.0/dist/js/uswds.min.js';
            script.setAttribute('data-uswds-fallback', 'true');
            script.onload = function () {
                console.log("\u2705 Full USWDS library loaded (fallback)");
                setTimeout(function () {
                    _this.initializeWithGlobalUSWDS();
                    resolve();
                }, 100);
            };
            script.onerror = function () {
                console.error("\u274C Failed to load USWDS library");
                _this.setupBasicComponent();
                reject(new Error('Failed to load USWDS'));
            };
            document.head.appendChild(script);
        })
    };
    initializeWithGlobalUSWDS();
    {
        var componentElement = this.querySelector('.usa-{{COMPONENT_KEBAB}}');
        if (componentElement && typeof window.USWDS !== 'undefined') {
            var USWDS = window.USWDS;
            if (USWDS.) {
                {
                    COMPONENT_CAMEL;
                }
            }
             && typeof USWDS.;
            {
                {
                    COMPONENT_CAMEL;
                }
            }
            on === 'function';
            {
                USWDS.;
                {
                    {
                        COMPONENT_CAMEL;
                    }
                }
                on(componentElement);
                console.log("\uD83C\uDFAF USWDS {{COMPONENT_KEBAB}} initialized (fallback mode)");
            }
        }
        this.setupEventForwarding();
    }
    async;
    setupBasicComponent();
    {
        console.log("\uD83D\uDD0D Setting up basic {{COMPONENT_KEBAB}} functionality");
        this.setupEventForwarding();
        console.log("\uD83C\uDFAF {{COMPONENT_NAME}} ready with basic functionality");
    }
    cleanupUSWDS();
    {
        var componentElement = this.querySelector('.usa-{{COMPONENT_KEBAB}}');
        // Try cleanup with direct import module first
        if (this.uswdsModule && typeof this.uswdsModule.off === 'function' && componentElement) {
            try {
                this.uswdsModule.off(componentElement);
                console.log("\uD83E\uDDF9 Cleaned up USWDS {{COMPONENT_KEBAB}} (tree-shaking mode)");
                return;
            }
            catch (error) {
                console.warn("\u26A0\uFE0F Error cleaning up tree-shaken USWDS:", error);
            }
        }
        // Fallback to global USWDS cleanup
        if (typeof window.USWDS !== 'undefined' && componentElement) {
            var USWDS = window.USWDS;
            if (USWDS.) {
                {
                    COMPONENT_CAMEL;
                }
            }
            off;
            {
                try {
                    USWDS.;
                    {
                        {
                            COMPONENT_CAMEL;
                        }
                    }
                    off(componentElement);
                    console.log("\uD83E\uDDF9 Cleaned up USWDS {{COMPONENT_KEBAB}} (fallback mode)");
                }
                catch (error) {
                    console.warn("\u26A0\uFE0F Error cleaning up fallback USWDS:", error);
                }
            }
        }
    }
    setupEventForwarding();
    {
        // Forward relevant DOM events as web component events
        var componentElement = this.querySelector('.usa-{{COMPONENT_KEBAB}}');
        if (componentElement) {
            // Example: Listen for change events and forward them
            componentElement.addEventListener('change', function (e) {
                var _a;
                _this.dispatchEvent(new CustomEvent('{{COMPONENT_KEBAB}}-change', {
                    detail: {
                        value: (_a = e.target) === null || _a === void 0 ? void 0 : _a.value,
                        originalEvent: e
                    },
                    bubbles: true,
                    composed: true
                }));
            });
        }
    }
    override;
    render();
    {
        return html(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      <div class=\"usa-{{COMPONENT_KEBAB}}\">\n        <!-- Component-specific USWDS HTML structure -->\n        <slot></slot>\n      </div>\n    "], ["\n      <div class=\"usa-{{COMPONENT_KEBAB}}\">\n        <!-- Component-specific USWDS HTML structure -->\n        <slot></slot>\n      </div>\n    "])));
    }
    // Public API methods
    override;
    focus();
    {
        var focusableElement = this.querySelector('input, button, [tabindex]');
        if (focusableElement) {
            focusableElement.focus();
        }
    }
    clear();
    {
        this.value = '';
    }
    isValid();
    boolean;
    {
        // Component-specific validation logic
        return true;
    }
}
var templateObject_1, templateObject_2;
