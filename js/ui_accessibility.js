'use strict';

// Existing modals keep their handlers; this adds keyboard containment and focus restoration.
(() => {
    const originals=new WeakMap(), attributes=new WeakMap();
    const translateText=node=>{
        if(node.parentElement?.closest('script,style,[data-i18n]'))return;
        const current=node.textContent,stored=originals.get(node);
        const original=stored && current===stored.translated ? stored.original : current;
        const leading=original.match(/^\s*/)?.[0]??'',trailing=original.match(/\s*$/)?.[0]??'';
        const translated=leading+I18n.legacy(original.trim())+trailing;
        originals.set(node,{original,translated});if(current!==translated)node.textContent=translated;
    };
    const localize=root=>{
        if(root.nodeType===Node.TEXT_NODE){translateText(root);return;}
        if(root.nodeType!==Node.ELEMENT_NODE)return;
        const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
        while((node=walker.nextNode()))translateText(node);
        for(const element of [root,...root.querySelectorAll('[title],[aria-label],[placeholder]')]) {
            const records=attributes.get(element)??{};
            for(const attr of ['title','aria-label','placeholder'])if(element.hasAttribute(attr)){
                const current=element.getAttribute(attr),stored=records[attr];
                const original=stored&&current===stored.translated?stored.original:current;
                const translated=I18n.legacy(original);records[attr]={original,translated};
                if(current!==translated)element.setAttribute(attr,translated);
            }
            attributes.set(element,records);
        }
    };
    localize(document.body);I18n.listeners.add(()=>localize(document.body));
    new MutationObserver(records=>{
        const nodes=new Set();for(const record of records){if(record.type==='characterData'||record.type==='attributes')nodes.add(record.target);else record.addedNodes.forEach(node=>nodes.add(node));}
        for(const node of nodes)if(node.isConnected)localize(node);
    }).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
    const previous=new Map();
    const focusables=panel=>[...panel.querySelectorAll('button,[href],input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
    const modalObserver=new MutationObserver(records=>{
        for(const {target} of records){
            const open=!target.classList.contains('hidden');
            target.setAttribute('aria-hidden',String(!open));
            if(open&&!previous.has(target)){previous.set(target,document.activeElement);(focusables(target)[0]??target).focus({preventScroll:true});}
            else if(!open&&previous.has(target)){const focus=previous.get(target);previous.delete(target);if(focus?.isConnected)focus.focus({preventScroll:true});}
        }
    });
    document.querySelectorAll('.modal-overlay').forEach(modal=>{
        modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.tabIndex=-1;
        const title=modal.querySelector('.modal-title');if(title){title.id ||= modal.id+'Title';modal.setAttribute('aria-labelledby',title.id);}
        modalObserver.observe(modal,{attributes:true,attributeFilter:['class']});
    });
    document.addEventListener('keydown',event=>{
        if(event.key!=='Tab')return;
        const open=[...document.querySelectorAll('.modal-overlay:not(.hidden)')].at(-1);if(!open)return;
        const controls=focusables(open);if(!controls.length){event.preventDefault();open.focus();return;}
        const first=controls[0],last=controls.at(-1);
        if(event.shiftKey&&(document.activeElement===first||!open.contains(document.activeElement))){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&(document.activeElement===last||!open.contains(document.activeElement))){event.preventDefault();first.focus();}
    });
})();
