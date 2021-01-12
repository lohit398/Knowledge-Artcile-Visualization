import { LightningElement, wire, track,api } from 'lwc';
import getKnowledgeCategories from '@salesforce/apex/DE_KnowledgeVisualizationHelper.getKnowledgeCategories'

export default class KnowledgeArticleDisplay extends LightningElement {
    @track knowledgeCategories = [];
    selectedKnowledgeArticleId;

    /*wire Method to fetch categories and organise appropriately*/
    @wire(getKnowledgeCategories)
    getCategories({ error, data }) {
        if (error)
            console.log(error);
        else if (data) {
            JSON.parse(JSON.stringify(data)).map(item => {
                let found = 0;

                for (let i = 0; i < this.knowledgeCategories.length; i++) {
                    if (item.DataCategoryGroupName === this.knowledgeCategories[i].DataCategoryGroupName) {
                        found = 1;
                        for (let [index, article] of this.knowledgeCategories[i].articleDetails.entries()) {
                            if (article.DataCategoryName === item.DataCategoryName) {
                                let obj = {};
                                obj.articleId = item.ParentId;
                                obj.articleName = item.Parent.Title;
                                this.knowledgeCategories[i].articleDetails[index].articles.push(obj);

                            }
                            let currentCategories = this.knowledgeCategories[i].articleDetails.map(dataCategory => {
                                return dataCategory.DataCategoryName;
                            });
                            if (currentCategories.indexOf(item.DataCategoryName) == -1) {
                                let obj = {};
                                obj.DataCategoryName = item.DataCategoryName;
                                obj.articles = [];
                                let subObj = {};
                                subObj.articleName = item.Parent.Title;
                                subObj.articleId = item.ParentId;
                                obj.articles.push(subObj);
                                this.knowledgeCategories[i].articleDetails.push(obj);
                            }
                        }
                    }
                }

                if (found === 0) {
                    let new_obj = {
                        DataCategoryGroupName: item.DataCategoryGroupName,
                        articleDetails: [],
                    };
                    let articleDetail = {
                        DataCategoryName: item.DataCategoryName,
                        articles: [],
                    };
                    let subObj = {};
                    subObj.articleName = item.Parent.Title;
                    subObj.articleId = item.ParentId;
                    articleDetail.articles.push(subObj);
                    console.log(articleDetail);
                    new_obj.articleDetails.push(articleDetail);

                    this.knowledgeCategories.push(new_obj);
                }
            })
        }
    }

    // handlers
    handleArticleClick(event){
        this.selectedKnowledgeArticleId = event.currentTarget.dataset.knowledgeid;
    }
}