import { createRoot } from '@wordpress/element';
import { Modal, Button, Flex } from '@wordpress/components';
import { useState, useEffect, useCallback } from '@wordpress/element';
import { edit as editIcon, code as codeIcon } from '@wordpress/icons';
import StyleEditor from 'react-style-editor';

// Helper function to create synthetic React event
const createSyntheticEvent = (value, textarea) => ({
    target: {
        value,
        type: 'textarea',
        nodeName: 'TEXTAREA'
    },
    currentTarget: textarea,
    type: 'change',
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    preventDefault: () => {},
    stopPropagation: () => {},
    isPropagationStopped: () => false,
    persist: () => {}
});

// Helper function to get WordPress textarea and its onChange handler
const getWordPressTextareaAndHandler = () => {
    const textarea = document.querySelector('.edit-site-global-styles-screen-css textarea');
    if (!textarea) return {};

    const key = Object.keys(textarea).find(key => key.startsWith('__reactProps$'));
    if (!key) return {};

    const originalOnChange = textarea[key].onChange;
    if (!originalOnChange) return {};

    return { textarea, originalOnChange };
};

const CustomCSSModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [cssContent, setCssContent] = useState('');
    const [isAdvancedMode, setIsAdvancedMode] = useState(true);
    const [fontSize, setFontSize] = useState(14);

    useEffect(() => {
        const clickHandler = (e) => {
            e.preventDefault();
            setCssContent(e.target.value);
            setIsOpen(true);
        };

        const initializeTextarea = (textarea) => {
            if (textarea && !textarea.hasAttribute('data-css-modal-initialized')) {
                textarea.addEventListener('click', clickHandler);
                textarea.setAttribute('data-css-modal-initialized', 'true');
            }
        };

        // Initial setup
        const textarea = document.querySelector('.edit-site-global-styles-screen-css textarea');
        initializeTextarea(textarea);

        // Watch for textarea
        const observer = new MutationObserver(() => {
            const textarea = document.querySelector('.edit-site-global-styles-screen-css textarea');
            initializeTextarea(textarea);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => {
            observer.disconnect();
            const textarea = document.querySelector('.edit-site-global-styles-screen-css textarea');
            if (textarea) {
                textarea.removeEventListener('click', clickHandler);
            }
        };
    }, []);

    const handleClose = useCallback(() => {
        const { textarea, originalOnChange } = getWordPressTextareaAndHandler();
        if (!textarea || !originalOnChange) {
            setIsOpen(false);
            return;
        }

        originalOnChange(createSyntheticEvent(cssContent, textarea));
        setIsOpen(false);
    }, [cssContent]);

    const handleChange = useCallback((value) => {
        setCssContent(value);
        
        const { textarea, originalOnChange } = getWordPressTextareaAndHandler();
        if (!textarea || !originalOnChange) return;

        originalOnChange(createSyntheticEvent(value, textarea));
    }, []);

    if (!isOpen) {
        return null;
    }

    return (
        <Modal
            title="Edit Additional CSS"
            onRequestClose={handleClose}
            className="custom-css-modal"
            size='large'
        >
            <div className="custom-css-modal__content">
                <div className="custom-css-modal__header" style={{ marginBottom: '30px' }}>
                    <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                        <div>
                            <Button
                                icon={isAdvancedMode ? codeIcon : editIcon}
                                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                                variant="secondary"
                            >
                                {isAdvancedMode ? 'Switch to Basic Editor' : 'Switch to Advanced Editor'}
                            </Button>
                        </div>
                        <Flex align="center" gap={2} justify="flex-end" style={{ flex: 1 }}>
                            <span className="custom-css-modal__font-label">Font size:</span>
                            <input
                                type="number"
                                value={fontSize}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (value >= 8 && value <= 32) {
                                        setFontSize(value);
                                    }
                                }}
                                min="8"
                                max="32"
                                className="custom-css-modal__font-input"
                            />
                            <span className="custom-css-modal__font-unit">px</span>
                        </Flex>
                    </Flex>
                </div>
                <div className="custom-css-modal__editor-container">
                    {isAdvancedMode ? (
                        <StyleEditor
                            value={cssContent}
                            onChange={handleChange}
                            tabSize={2}
                            insertSpaces={true}
                            className="custom-css-modal__editor"
                            style={{
                                fontFamily: 'monospace',
                                fontSize: `${fontSize}px`,
                                height: '500px',
                                width: '100%'
                            }}
                        />
                    ) : (
                        <textarea
                            className="custom-css-modal__textarea"
                            value={cssContent}
                            onChange={(e) => handleChange(e.target.value)}
                            style={{
                                fontFamily: 'monospace',
                                fontSize: `${fontSize}px`,
                                height: '500px',
                                width: '100%',
                                resize: 'vertical'
                            }}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

// Initialize the app when WordPress is ready
wp.domReady(() => {

    const modalRoot = document.createElement('div');
    modalRoot.id = 'custom-css-modal-root';
    document.body.appendChild(modalRoot);

    const root = createRoot(modalRoot);
    root.render(<CustomCSSModal />);
});
