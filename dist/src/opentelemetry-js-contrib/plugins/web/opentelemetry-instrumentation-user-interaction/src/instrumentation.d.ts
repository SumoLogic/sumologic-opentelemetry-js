import { InstrumentationBase } from '@opentelemetry/instrumentation';
import * as api from '@opentelemetry/api';
import { EventName, UserInteractionInstrumentationConfig } from './types';
/**
 * This class represents a UserInteraction plugin for auto instrumentation.
 * It patches addEventListener of HTMLElement.
 */
export declare class UserInteractionInstrumentation extends InstrumentationBase<unknown> {
    readonly component: string;
    readonly version = "0.32.0";
    moduleName: string;
    private _spansData;
    private _isEnabled;
    private _wrappedListeners;
    private _eventsSpanMap;
    private _eventNames;
    private _shouldPreventSpanCreation;
    constructor(config?: UserInteractionInstrumentationConfig);
    init(): void;
    /**
     * Controls whether or not to create a span, based on the event type.
     */
    protected _allowEventName(eventName: EventName): boolean;
    /**
     * Creates a new span
     * @param element
     * @param eventName
     */
    private _createSpan;
    /**
     * Returns true if we should use the patched callback; false if it's already been patched
     */
    private addPatchedListener;
    /**
     * Returns the patched version of the callback (or undefined)
     */
    private removePatchedListener;
    private _invokeListener;
    /**
     * This patches the addEventListener of HTMLElement to be able to
     * auto instrument the click events
     */
    private _patchAddEventListener;
    /**
     * This patches the removeEventListener of HTMLElement to handle the fact that
     * we patched the original callbacks
     */
    private _patchRemoveEventListener;
    /**
     * Most browser provide event listener api via EventTarget in prototype chain.
     * Exception to this is IE 11 which has it on the prototypes closest to EventTarget:
     *
     * * - has addEventListener in IE
     * ** - has addEventListener in all other browsers
     * ! - missing in IE
     *
     * HTMLElement -> Element -> Node * -> EventTarget **! -> Object
     * Document -> Node * -> EventTarget **! -> Object
     * Window * -> WindowProperties ! -> EventTarget **! -> Object
     */
    private _getPatchableEventTargets;
    /**
     * Updates interaction span name
     * @param url
     */
    _updateSpanAsNavigation(span: api.Span): void;
    /**
     * implements enable function
     */
    enable(): void;
    /**
     * implements unpatch function
     */
    disable(): void;
}
