import { LightningElement, track } from 'lwc';
import searchKnowledgeArticles from '@salesforce/apex/KnowledgeTreeVisualizer_Helper.searchKnowledgeArticles';

export default class KnowledgeLookup extends LightningElement {
    @track searchedArticles = []
    handleSearch(event) {
        if (event.target.value.length > 3) {
            let searchTerm = event.target.value;
            searchKnowledgeArticles({ searchTerm: searchTerm })
                .then(data => {
                    this.searchedArticles = JSON.parse(JSON.stringify(data));
                    if (this.searchedArticles.length === 0)
                        this.searchedArticles.push({ DataCategoryName: 'None', Parent: { Id: 'No Article', Title: 'No Article Found' } })
                })
            this.template.querySelector('.slds-dropdown-trigger_click').classList.add('slds-is-open');
        }
        else {
            if (this.template.querySelector('.slds-is-open') != null) {
                this.template.querySelector('.slds-is-open').classList.remove('slds-is-open');
            }
        }
    }
    handleArticleClick(event) {
        if (event.currentTarget.dataset.articleid != 'No Article') {
            this.dispatchEvent(new CustomEvent('searcharticle', { detail: { articleId: event.currentTarget.dataset.articleid, categoryName: event.currentTarget.dataset.categoryname } }));
            this.template.querySelector('.slds-is-open').classList.remove('slds-is-open');
        }
    }
}