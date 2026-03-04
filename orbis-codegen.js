/**
 * SDTM Orbis CodeGen - Client-side JavaScript
 * Handles DevExtreme component initialization and API interaction
 */

(function () {
    'use strict';

    // Module-level variables
    let domainSelectBox;
    let generatePopup;
    let generateCodeBtn;
    let specLocationTextBox;
    let availableDomains = [];
    let savedFilePath = '';

    /**
     * Initialize DevExtreme components when DOM is ready
     */
    $(document).ready(function () {
        initializeComponents();
    });

    /**
     * Initialize all DevExtreme components
     */
    function initializeComponents() {
        initializeToolbar();
        initializePopup();
    }

    /**
     * Initialize the toolbar with "Orbis CodeGen" button
     */
    function initializeToolbar() {
        $("#orbisToolbar").dxToolbar({
            items: [
                {
                    location: 'before',
                    widget: 'dxButton',
                    options: {
                        template: function() {
                            return $('<div class="orbis-btn-content">' +
                                '<span class="ai-badge">AI</span>' +
                                '<span class="btn-text">Orbis CodeGen</span>' +
                                '</div>');
                        },
                        type: 'success',
                        elementAttr: {
                            class: 'orbis-codegen-btn'
                        },
                        onClick: function() {
                            generatePopup.show();
                        }
                    }
                }
            ]
        });
    }

    /**
     * Initialize the popup for domain selection
     */
    function initializePopup() {
        generatePopup = $("#generatePopup").dxPopup({
            title: "Select Domain for Code Generation",
            width: 700,
            height: 500,
            onShowing: handlePopupShowing,
            onShown: function() {
                // Initialize components after popup is shown
                if (!domainSelectBox) {
                    createPopupContent();
                }
            }
        }).dxPopup("instance");
    }

    /**
     * Create the popup content structure
     * Initializes DevExtreme components within the popup
     */
    function createPopupContent() {
        // Initialize SDTM Spec Location (read-only text box)
        specLocationTextBox = $("#specLocation").dxTextBox({
            value: savedFilePath || 'No file uploaded',
            readOnly: true,
            placeholder: "File path will appear here..."
        }).dxTextBox("instance");

        // Initialize domain dropdown
        domainSelectBox = $("#domainSelect").dxSelectBox({
            placeholder: "Select a domain...",
            dataSource: [],
            onValueChanged: handleDomainSelection
        }).dxSelectBox("instance");

        // Initialize refresh domains button
        $("#refreshDomainsBtn").dxButton({
            icon: "refresh",
            hint: "Refresh domains",
            type: "default",
            onClick: handleRefreshDomains
        });

        // Initialize generate code button
        generateCodeBtn = $("#generateCodeBtn").dxButton({
            text: "Generate Code",
            type: "success",
            width: "100%",
            disabled: true,
            onClick: handleGenerateClick
        }).dxButton("instance");
    }

    /**
     * Handle popup showing event
     */
    function handlePopupShowing() {
        loadDomains();
    }

    /**
     * Load available domains from the Upload API
     * MOCK VERSION - Uses mock data instead of real API
     */
    async function loadDomains() {
        showStarsLoader('Loading domains...');
        hideError();

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            availableDomains = [
                "AE, SUPPAE",
                "DM, SUPPDM",
                "VS, SUPPVS",
                "LB, SUPPLB",
                "EX, SUPPEX",
                "CM, SUPPCM"
            ];
            savedFilePath = '/mock/path/to/uploaded/file.xpt';

            if (specLocationTextBox) {
                specLocationTextBox.option('value', savedFilePath);
            }

            if (domainSelectBox) {
                domainSelectBox.option('dataSource', availableDomains);
                domainSelectBox.option('value', null);
            }
        } catch (error) {
            showError(`Error loading domains: ${error.message}`);
        } finally {
            hideStarsLoader();
        }
    }

    /**
     * Handle refresh domains button click
     */
    function handleRefreshDomains() {
        loadDomains();
    }

    /**
     * Show the loader for code generation
     * Displays loading message over the popup
     * @param {string} message - Optional custom message to display
     */
    function showStarsLoader(message) {
        hideStarsLoader();
        
        const loaderText = message || 'AI is generating your code';
        const loaderContainer = $('<div class="stars-loader-container fade-in"></div>');
        const text = $('<div class="stars-loader-text">' + loaderText + '</div>');
        
        loaderContainer.append(text);
        
        // Find popup content
        let targetElement = $('#generatePopup .dx-popup-content');
        if (targetElement.length === 0) {
            targetElement = $('#generatePopup .dx-overlay-content');
        }
        if (targetElement.length === 0) {
            targetElement = $('.popup-content');
        }
        
        if (targetElement.length > 0) {
            targetElement.css({'position': 'relative', 'min-height': '100%'});
            targetElement.append(loaderContainer);
        }
    }

    /**
     * Hide the loader
     */
    function hideStarsLoader() {
        const loader = $('.stars-loader-container');
        if (loader.length > 0) {
            loader.removeClass('fade-in').addClass('fade-out');
            setTimeout(() => loader.remove(), 300);
        }
    }

    /**
     * Display an error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        const errorDisplay = document.getElementById('errorDisplay');
        if (errorDisplay) {
            errorDisplay.textContent = escapeHtml(message);
            errorDisplay.style.display = 'block';
        }
    }

    /**
     * Hide the error message
     */
    function hideError() {
        const errorDisplay = document.getElementById('errorDisplay');
        if (errorDisplay) {
            errorDisplay.style.display = 'none';
            errorDisplay.textContent = '';
        }
    }

    /**
     * Handle domain selection change
     * @param {Object} e - Event object with value property
     */
    function handleDomainSelection(e) {
        const isSelected = e.value !== null && e.value !== undefined && e.value !== '';
        if (generateCodeBtn) {
            generateCodeBtn.option('disabled', !isSelected);
        }
    }

    /**
     * Generate code by calling the Generate API
     * MOCK VERSION - Uses mock data instead of real API
     */
    async function generateCode() {
        const selectedDomain = domainSelectBox ? domainSelectBox.option('value') : null;
        
        if (!selectedDomain) {
            return;
        }

        showStarsLoader('AI is generating your code...');
        
        if (generateCodeBtn) {
            generateCodeBtn.option('disabled', true);
        }

        hideError();

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const mockCode = generateMockSASCode(selectedDomain);
            injectCodeIntoEditor(mockCode);
            
            if (generatePopup) {
                generatePopup.hide();
            }
        } catch (error) {
            showError(`Error generating code: ${error.message}`);
        } finally {
            hideStarsLoader();
            if (generateCodeBtn) {
                generateCodeBtn.option('disabled', false);
            }
        }
    }

    /**
     * Generate mock SAS code for a given domain
     * @param {string} domain - The selected domain
     * @returns {Object} Mock code object
     */
    function generateMockSASCode(domain) {
        const domains = domain.split(',').map(d => d.trim());
        const mockCode = {};
        
        domains.forEach(d => {
            mockCode[d] = `/* ========================================
   SAS Code for ${d} Domain
   Generated by Orbis CodeGen AI
   ======================================== */

DATA ${d.toLowerCase()};
    SET source.${d.toLowerCase()};
    
    /* Data transformations */
    LENGTH studyid $20 domain $2 usubjid $40;
    
    studyid = "MOCK-STUDY-001";
    domain = "${d}";
    usubjid = CATX("-", studyid, subjid);
    
    /* Apply SDTM standards */
    FORMAT --dtc IS8601DT.;
    
    /* Data validation */
    IF missing(usubjid) THEN DO;
        PUT "WARNING: Missing USUBJID for record " _N_;
    END;
    
    /* Output dataset */
    OUTPUT;
RUN;

/* Create metadata */
PROC CONTENTS DATA=${d.toLowerCase()} OUT=metadata;
RUN;

/* Generate summary statistics */
PROC FREQ DATA=${d.toLowerCase()};
    TABLES domain / NOCUM NOPERCENT;
RUN;

/* End of ${d} domain processing */
`;
        });
        
        return mockCode;
    }

    /**
     * Handle Generate Code button click
     */
    function handleGenerateClick() {
        generateCode();
    }

    /**
     * Inject generated code into the code editor
     * @param {Object} codeObject - Generated code object from API
     */
    function injectCodeIntoEditor(codeObject) {
        const editor = document.getElementById('codeEditor');
        if (editor) {
            editor.value = formatCode(codeObject);
        }
    }

    /**
     * Format code object into readable string
     * @param {Object} codeObject - Code object to format
     * @returns {string} Formatted code string
     */
    function formatCode(codeObject) {
        if (!codeObject) {
            return '';
        }

        // If it's already a string, return it
        if (typeof codeObject === 'string') {
            return codeObject;
        }

        // If it's an object, format each domain's code
        let formattedCode = '';
        for (const [domain, code] of Object.entries(codeObject)) {
            formattedCode += `/* ========== ${domain} ========== */\n\n`;
            formattedCode += code;
            formattedCode += '\n\n';
        }

        return formattedCode;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();
